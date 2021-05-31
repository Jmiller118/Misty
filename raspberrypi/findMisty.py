Last login: Fri May 28 09:36:16 on ttys000
-bash: thenn: command not found

The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ ssh pi@raspberrypi.local
pi@raspberrypi.local's password: 
Linux raspberrypi 5.4.83-v7l+ #1379 SMP Mon Dec 14 13:11:54 GMT 2020 armv7l

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Fri May 21 14:41:22 2021

SSH is enabled and the default password for the 'pi' user has not been changed.
This is a security risk - please login as the 'pi' user and type 'passwd' to set a new password.

pi@raspberrypi:~ $ 
pi@raspberrypi:~ $ 
pi@raspberrypi:~ $ 
pi@raspberrypi:~ $ sudo init 0
Connection to raspberrypi.local closed by remote host.
Connection to raspberrypi.local closed.
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ ssh pi@raspberrypi.local
^C
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ ssh pi@raspberrypi.local
pi@raspberrypi.local's password: 

(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ 
(base) Jordans-MacBook-Pro:~ jordanmiller$ ssh pi@raspberrypi.local
pi@raspberrypi.local's password: 
Linux raspberrypi 5.4.83-v7l+ #1379 SMP Mon Dec 14 13:11:54 GMT 2020 armv7l

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Sun May 30 22:25:33 2021

SSH is enabled and the default password for the 'pi' user has not been changed.
This is a security risk - please login as the 'pi' user and type 'passwd' to set a new password.

pi@raspberrypi:~ $ sudo init 0
Connection to raspberrypi.local closed by remote host.
Connection to raspberrypi.local closed.
(base) Jordans-MacBook-Pro:~ jordanmiller$ ssh pi@raspberrypi.local
pi@raspberrypi.local's password: 
Linux raspberrypi 5.4.83-v7l+ #1379 SMP Mon Dec 14 13:11:54 GMT 2020 armv7l

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Sun May 30 22:27:01 2021

SSH is enabled and the default password for the 'pi' user has not been changed.
This is a security risk - please login as the 'pi' user and type 'passwd' to set a new password.

pi@raspberrypi:~ $ ls
Bookshelf  Documents  Music     Public     Videos
Desktop    Downloads  Pictures  Templates
pi@raspberrypi:~ $ cd Documents/
pi@raspberrypi:~/Documents $ ls
mistyTeleop
pi@raspberrypi:~/Documents $ cd mistyTeleop/
pi@raspberrypi:~/Documents/mistyTeleop $ ks
-bash: ks: command not found
pi@raspberrypi:~/Documents/mistyTeleop $ ls
findMisty.py   mistyTeleop.py      __pycache__  streamLatestFrame.py
mistyHead.png  mistyWallpaper.png  pyMisty.py
pi@raspberrypi:~/Documents/mistyTeleop $ vim findMisty.py 

import socket 
import grequests 
import json 
 
# SCANS NETWORK FOR AVAILABLE MISTY'S 
 
class MistyScanner: 
 
    def __init__(self): 
        self.self_ip = self.find_self_ip()  
        self.base_ip = self.self_ip[:self.self_ip.rfind(".")+1]  
 
    def find_self_ip(self): 
        print("Getting this device's IP:") 
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) 
        s.connect(("8.8.8.8", 80)) 
        ip = s.getsockname()[0] 
        print("Found Device IP:", ip) 
        s.close() 
        return ip 
     
    def scan_for_misty(self): 
        print("Starting scan to find Mistys:") 
        urls = [] 
        mistys_found = [] 
         
        for i in range (256): 
            urls.append('http://' + self.base_ip + str(i) + '/api/device') 
        results = grequests.map((grequests.get(u, timeout=0.5) for u in urls), exception_handler=self.exception, size=5) 
        for result in results: 
            if result != None: 
                try: 
                    data = json.loads(result.text) 
                    mistys_found.append([data["result"]["ipAddress"],data["result"]["macAddress"],data["result"]["serialNumber"]]) 
                except: 
                    print("Skipped") 
         
        print ("Number of Misty's Found ", len(mistys_found)) 
        print (mistys_found) 
        return mistys_found 
 
    def exception(self, request, exception): 
        # print ("Problem: {}: {}".format(request.url, exception)) 
        pass 
-- VISUAL --                                                                                        48        1,1           Top
