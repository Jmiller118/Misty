#importing regex and random libraries
import re
import random

# negative responses
negative_words = ("no", "no way", "of course not", "nope", "not a chance", "sorry", "surely not that")
# exiting conversation 
exit_words = ("I am done here", "quit", "pause", "exit", "goodbye", "bye", "later")

# random starters
random_questions = (
    "What languages do you speak? ", 
    "What languages would you like yo learn? ", 
    "Are you more interested in Spanish or French? ", 
    "Did you learn any foreign lanaguges in school? "
  )

name = ""

misty_talk = (
  # languages...
  {r'.*\s*language':
    ("I am learning to speak several lanaguges. ",
    "I have ability to teach you some new words. ")
    },
  # why do you...?
    {r'why\sdo\syou\s(.*[^\?]*)\??':
     ("I really enjoy 0}? ",
      "I can {0}?")
    },
 # Other responses
    {r'.*':
     ("How do you learn best? ",
      "Would you like to start with a specific topic? ",       "Do you have freinds who speak other languages? ")
    }
)
# greeting:
def greet():
  name = input("Hello there, what is your name? ")
  will_learn = input("Hi {}, I am Misty! Would you like to learn with me? ".format(name)).lower()
  if will_learn in negative_words:
    print ("Ok, have a wonderful day! I will talk to you soon!")
    return
  return True

# exiting function
def make_exit(reply):
  for exit_word in exit_words: 
    if exit_word.lower() in reply: 
      print ("Ok, we will learn something together another time then!")
      return True

def misty_bot():
  if greet():
    reply = input(random.choice(random_questions)).lower()
    while not make_exit(reply):
      reply = converse(reply)
      
def converse(reply):
  for pair in misty_talk:
    for regex_pattern, misty_answers in pair.items():
      found_match = re.match(regex_pattern, reply)
      if found_match: 
        misty_answer = random.choice(misty_answers)
        formatted_misty_answer = misty_answer.format(*[reflect(matching_group) for matching_group in found_match.groups()])
        reply = input(formatted_misty_answer).lower()
        return reply

reflections = {  
    "i'm": "you are",
    "you're": "i'm",
    "was": "were",
    "i": "you",
    "are": "am",
    "am": "are",
    "i'd": "you would",
    "i've": "you have",
    "i'll": "you will",
    "my": "your",
    "you've": "I have",
    "you'll": "I will",
    "your": "my",
    "yours": "mine",
    "you": "I",
    "me": "you"
}
def reflect(response):
  words = response.split()
  for index, word in enumerate(words):
    if word in reflections:
      words[index] = reflections[word]
  return ' '.join(words)

misty_bot()
