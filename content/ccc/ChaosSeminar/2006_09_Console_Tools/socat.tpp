--heading socat - das Schweizer Taschenmesser fürs Netz
                          ²²Ë¿.                           
                          û²Û²²Ö.                         
                          -²²Û²p×p                        
                           -²²Û²ËMË.                      
                            -²²Û²ÜÆ×,                     
                             -×Û²Û²×²Ú                    
             ¿Ü²ÜÒÉÖ¿.         MÛ²Û²Û²å                   
             -¥Û²ÛÛ²²×ËÖ,      úÓÛ²Û²²ÛË                  
               Ô×²²×××²²××Ö,     Ô²Û²Û²ÛË.                
                ùÓ¥²×²×××²×²Ë·,ù  Ä²²Û²Û²Ü,               
                   -ÓM×²²×²×²²××Ö_ -×Û²Û²Û²,              
                      ÿÓM²×²××²×²××·;M²Û²Û²²p             
                         ÿÏN×²××²×²×²×²²²Û²²²p            
                            ùÏ¥²×××²×××²×Ü²²Û²p           
                                ÔM××××××²²²²²²²Ë          
   .ù,___¿¿   ùúù:úùùù:ù -ùù:ù:ù:._?¥×M¥×²Û²ÛÛ²Ûp         
 ªÉË×ËËËËÒÒÒÉËËËËËÉÉÉÉËËËËËËËËÉÒÒyayÂÂ¿¿Ú¿_ZZ°m#qÉ¿,      
_××h¿ª¿¿Ú¿ÚÚ=Ú=÷||++||+|ö¯öö{""öÍÍ!ÍÍ??ÁÁ?ÁÁ?ÁÍÁÏÓN×/     
j××N××××Ü××Ü××××××É××Ë××·Ë×ËË××Ò××·××ËË××Ö××Ò××ËÜ·/)k     
Þ×²²²×²²¥²²¥²×²×²××²²¥²Q××²Ë²×²×²²×²Ü×²Ü²×Ü²×²Ü²²Ë²,±     
)×²Ë²²²²²²×²²×²²×²²²²²²²ÜÜ²Ü²Ü²²×²²²¥²²ß²²×²²²¥²²ß²xË,    
 Ô××²×²²Ò²²×²²×²²²×²²Ë²²Q²²××²²×²²×²²²²²²×²²×²²×²²×@¸ 
   ÿÁ¥²²××@TÍÁÏ?@Q²×éÁÙ""""ÍÍÍÍÍÍÁÙÀ¦ÏÏÏÏÓMßMMßMÓ¾ÓÓ
      Ôß²²²×·¿,-QùÓ²²·,                             
        ÿÓ×²²²×ËWp,Ä×²×¿.                              
           -Ó×²²²××·.{Ü²Ë,                                
              -ß×²Ü×¿Õ×²×¥,                               
                ùÔß²²Û²²²²²·¿.                            
                    Ôß²²²²²²ÛÜË¿..                        
                      -ß²²²²²²Û²²·Úÿ                      
                        )×Û²Û²²Û²Û²Ü·ÿ                    
                          4××Û²² ²²ÛÛ²/                   
                           Ä¥@²Û²  Óß²²/                  
                            ùÓQ×²²   ²À'                  
                              úÔß²²                       
--newpage
--heading socat - Multipurpose relay

* netcat++
  * netcat: Von Netz nach stdout / Von stdin zum Netz
  * socat: in und out (nahezu) beliebig konfigurierbar
  * Bidirektionales Relay zwischen zwei Byteströmen

---
* Client-Connect an TCP-Port:
  * netcat ulm.ccc.de 80
  * socat - TCP4:ulm.ccc.de:80

---
* Mini-Server an Port binden:
  * netcat -l -p 1234
  * socat TCP4-LISTEN:1234,reuseaddr -

---
* Provisorische remote shell:
  * netcat -l -p 1234 -e /bin/bash
  * socat TCP4-LISTEN:1234,reuseaddr EXEC:/bin/bash,stderr
--newpage
--heading Und weiter...?

* "Semiprofessioneller" Server mit forking:
  socat TCP4-LISTEN:1234,reuseaddr,fork \
        EXEC:/bin/bash,stderr

---
* Zu unsicher? Na, dann mal nur an localhost binden:
  socat TCP4-LISTEN:1234,reuseaddr,fork,bind=localhost \
        EXEC:/bin/bash,stderr

---
* Zu restriktiv? Nur ein paar IPs zulassen...
  socat TCP4-LISTEN:1234,reuseaddr,fork,range=192.168.0.0/16 \
        EXEC:/bin/bash,stderr

---
* ...oder gleich als Dummuser in ein chroot-Jail:
  socat TCP4-LISTEN:1234,reuseaddr,fork,chroot=/tmp/sandbox,su=dummy \
        EXEC:/bin/bash,stderr
--newpage
--heading Parameteraufbau

* Adreßtyp
  * Clients wie z.B. TCP4, IP4, UDP4 (gibt's alles auch für IPv6), OPENSSL
  * Server wie z.B. TCP4-LISTEN, IP4 (Raw-Socket), UDP4-LISTEN, OPENSSL-LISTEN
  * Socks-Server und Proxies: PROXY, SOCKS4
  * Standard-Streams: STDIN, STDOUT, STDERR, PTY
  * Verbesserte Eingabe mit History: READLINE
  * IPC: UNIX-CONNECT, UNIX-LISTEN, PIPE
  * Datei-IO: FILE
  * Programmaufrufe: EXEC, SYSTEM

* Zwingende Parameter
  * Mit Doppelpunkt getrennt

* Optionale Parameter
  * Durch Kommas getrennt

* man socat!
--newpage
--heading Mehr oder minder abstruse Anwendungsbeispiele

* "Mal kurz" ein Relay
  socat TCP4-LISTEN:1234,reuseaddr,fork \
        TCP4:destination.host:2345

---
* ...mit Debug-Ausgabe...
  * ASCII -v, HEX -x... oder beides:
--beginshelloutput
  $ socat -v -x TCP4-LISTEN:1234,reuseaddr TCP4:dest.host:2345
  >  48 65 6c 6c 6f 20 77 6f 72 6c 64 21 0a           Hello world!.
  --
  <  54 68 69 73 20 69 73 20 61 20 74 65 73 74 20 72  This is a test r
  <  65 70 6c 79 2e 2e 2e 20 54 68 69 73 20 69 73 20  eply... This is
  <  61 20 74 65 73 74 20 72 65 70 6c 79 2e 2e 2e 0a  a test reply....
  --
--endshelloutput

---
* "Händisches" scp
  Aus OpenSSL: /etc/ssl/misc/CA.sh -newcert
  socat -u OPENSSL-LISTEN:2345,reuseaddr, \
        cert=newcert.pem,key=newkey.pem,verify=false \
	FILE:/tmp/destfile
  socat -u FILE:/tmp/srcfile \
        OPENSSL:remote.host:2345,cafile=newcert.pem

---
* Primitiver Log-Daemon
  socat -u TCP4-LISTEN:3334,reuseaddr,fork \
           OPEN:/tmp/primitive.log,creat,append

---
* TCP gender changer 
  * Relay, wenn beide Parteien hinter NAT-Router (o.ä.)
  socat TCP4-LISTEN:1234 TCP-LISTEN:2345
