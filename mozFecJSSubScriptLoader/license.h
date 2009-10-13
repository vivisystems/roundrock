#ifndef LICENSE_H_
#define LICENSE_H_

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <memory.h>

#include <unistd.h>

#include <sys/ioctl.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <linux/if.h>


#ifdef __cplusplus
extern "C" {
#endif

void register_algs(void);
void sha256string (const char *src, char *dest, unsigned long *len);
void md5string (const char *src, char *dest, unsigned long *len);
void get_encrypt_key(unsigned char *desc);
int mac_addr_sys ( char *addr);
int getDallas(char *buf);
int checkDallas();
int getLicenseStubKey(char *buf);
int getLicenseStubKeyEx(char *buf, const char *dallas, const char *system_name, const char *vendor_name, const char *mac);
int getLicenseFromStubKey(const char *stub, char *buf);
int getLicenseFromDallas(char *buf);
int getLicenseFromFile(const char *file, char *buf);
int checkLicenseFromFile(const char *file);
int getSystemName(char *buf);
int getVendorName(char *buf);

#ifdef __cplusplus
   }
#endif

#endif /* LICENSE_H_ */
