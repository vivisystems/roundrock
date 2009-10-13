#include "license.h"

#include <tomcrypt.h>

// compat header should always be first header if including system headers
#include "smbios/compat.h"

#include "smbios/IMemory.h"
#include "smbios/SystemInfo.h"
#include "smbios/version.h"

#include "dallas.h"

void register_algs(void)
{
   
    register_cipher (&aes_desc);
    register_cipher(&blowfish_desc);
    register_cipher (&twofish_desc);
    register_cipher(&cast5_desc);
    register_hash (&md5_desc);
    register_hash (&sha1_desc);
    register_hash(&sha256_desc);
    register_prng(&yarrow_desc);
    register_prng(&sprng_desc);

}

void sha256string (const char *src, char *dest, unsigned long *len) {

   unsigned long i;
   unsigned char buf[MAXBLOCKSIZE];
   char tmp[] ="00";


   // self register
   if(find_hash("sha256") == -1) register_hash(&sha256_desc);

   *len = sizeof(buf);
   memset(dest, 0, sizeof(dest));

   hash_memory(find_hash("sha256"), (unsigned char*) src, strlen(src), buf, len);

   for (i=0; i< *len; i++) {
       sprintf(tmp, "%02x", buf[i]);
       strcat(dest, tmp);
   }
}


void md5string (const char *src, char *dest, unsigned long *len) {

   unsigned long i;
   unsigned char buf[MAXBLOCKSIZE];
   char tmp[] ="00";

   // self register
   if(find_hash("md5") == -1) register_hash(&md5_desc);


   *len = sizeof(buf);
   memset(dest, 0, sizeof(dest));

   hash_memory(find_hash("md5"), (unsigned char*) src, strlen(src), buf, len);

   for (i=0; i< *len; i++) {
       sprintf(tmp, "%02x", buf[i]);
       strcat(dest, tmp);
   }
}

void get_encrypt_key(unsigned char *desc) {

        unsigned char tmpkey[512], tmpkey2[16], tmpkey3[33];
        unsigned long key_len;

        char key11[] = "ra", key12[] = "ck";
        char key21[] = "ac", key22[] = "ha", key23[] ="ng";
        char key31[] = "ir", key32[] = "vi";
        char key41[] = "vi", key42[] = "pos";

        memset(tmpkey, 0, sizeof(tmpkey));

        // key1
        memset(tmpkey2, 0, sizeof(tmpkey2));
        strcat((char *) tmpkey2, key11);
        strcat((char *)tmpkey2, key12);
        md5string((char *)tmpkey2, (char *)tmpkey3, &key_len);
        strcat((char *) tmpkey, (char *)tmpkey3);

        // key2
        memset(tmpkey2, 0, sizeof(tmpkey2));
        strcat((char *) tmpkey2, key21);
        strcat((char *)tmpkey2, key22);
        strcat((char *)tmpkey2, key23);
        md5string((char *)tmpkey2, (char *)tmpkey3, &key_len);
        strcat((char *) tmpkey, (char *)tmpkey3);

        // key3
        memset(tmpkey2, 0, sizeof(tmpkey2));
        strcat((char *)tmpkey2, key31);
        strcat((char *)tmpkey2, key32);
        strcat((char *)tmpkey2, key23);
        md5string((char *)tmpkey2, (char *)tmpkey3, &key_len);
        strcat((char *) tmpkey, (char *)tmpkey3);

        // key4 force
        memset(tmpkey2, 0, sizeof(tmpkey2));
        strcat((char *) tmpkey2, key41);
        strcat((char *)tmpkey2, key41);
        strcat((char *)tmpkey2, key42);
        md5string((char *)tmpkey2, (char *)tmpkey3, &key_len);
        strcat((char *) tmpkey, (char *)tmpkey3);

        strcpy((char *)desc, (char *)tmpkey);

}

void inline chop(char*p) {   // remove the last new Line if any
    if(*p == 0) return;  // empty string!  ( *p 與 p[0] 完全相同 )
    while(*p != 0)  ++p;   // move forward till string terminated
    p--;   // move back one char
    if(*p == '\n') *p = 0;  // remove the tail new Line
}

int checkDallas() {
    unsigned char dallas[8];
    int retval = 0;

    retval = ow_read(dallas);
    return retval;

}

int getDallas(char *buf) {

    int retval = 0;
    retval = ow_read2hex(buf);
    return retval;

}

int mac_addr_sys ( char *addr) {
    struct ifreq ifr;
    
    unsigned char buf[6];
    char tmp[5] = "";
    int s, i;
    int ok = 0;

    s = socket(AF_INET, SOCK_DGRAM, 0);
    if (s==-1) {
        return -1;
    }

    for (i = 0; i<= 9; i++) {

	sprintf(tmp,"eth%d", i);

        strcpy(ifr.ifr_name, tmp);
                if (ioctl(s, SIOCGIFHWADDR, &ifr) == 0) {
                    ok = 1;
                    break;
                }
    }

    close(s);

    if (ok) {
        bcopy( ifr.ifr_hwaddr.sa_data, buf, 6);
        sprintf(addr, "%02x%02x%02x%02x%02x%02x", buf[0],buf[1],buf[2],buf[3],buf[4],buf[5]);
    }
    else {
        return -1;
    }
    return 0;
}


int getSystemName(char *buf) {
    const char *str = 0;
    str   = SMBIOSGetSystemName();
    if(str) {
        strcpy(buf, str);
	SMBIOSFreeMemory(str);
	return 0;
    } else {
        memset(buf, 0, sizeof(buf));
	return -1;
    }

}


int getVendorName(char *buf) {
    const char *str = 0;
    str   = SMBIOSGetVendorName();
    if(str) {
        strcpy(buf, str);
	SMBIOSFreeMemory(str);
	return 0;
    } else {
        memset(buf, 0, sizeof(buf));
	return -1;
    }

}

int getLicenseStubKey(char *buf) {

    char dallas[17];
    char system_name[33], vendor_name[33], mac[13];
    int dallas_result = 0, retval = 0;

    dallas_result = ow_read2hex(dallas);

    retval = getSystemName(system_name);

    retval = getVendorName(vendor_name);

    mac_addr_sys(mac);

    char md5key[33], tmpkey[255];
    unsigned long len;

    memset(tmpkey, 0, 255);

    // cpy dallas with md5
    md5string(dallas, md5key, &len);
    strncpy(tmpkey, md5key, len*2);

    // cat system with md5
    md5string(system_name, md5key, &len);
    strncat(tmpkey, md5key, len*2);

    // cat vendor 
    md5string(vendor_name, md5key, &len);
    strncat(tmpkey, md5key, len*2);

    // cat mac with md5
    md5string(mac, md5key, &len);
    strncat(tmpkey, md5key, len*2);

    strcpy(buf, tmpkey);

    return dallas_result;

}

int getLicenseStubKeyEx(char *buf, const char *dallas, const char *system_name, const char *vendor_name, const char *mac) {

    char md5key[33], tmpkey[255];
    unsigned long len;

    memset(tmpkey, 0, 255);

    // cpy dallas with md5
    md5string(dallas, md5key, &len);
    strncpy(tmpkey, md5key, len*2);

    // cat system with md5
    md5string(system_name, md5key, &len);
    strncat(tmpkey, md5key, len*2);

    // cat vendor
    md5string(vendor_name, md5key, &len);
    strncat(tmpkey, md5key, len*2);

    // cat mac with md5
    md5string(mac, md5key, &len);
    strncat(tmpkey, md5key, len*2);


    strcpy(buf, tmpkey);

    return 0;

}



int getLicenseFromDallas(char *buf) {

    char license_tmp[129]="";
    unsigned char encrypt_key[129]="";
    char key[65], key2[65];
    unsigned long len = 0;
    int retval =0;

    retval = getLicenseStubKey(license_tmp);

    // generate runtime key		

    // encrypt key sha256
    get_encrypt_key(encrypt_key);
    sha256string((char *) encrypt_key, key, &len);

    strcpy(buf, key);

    // sha256 stub key
    sha256string(license_tmp, key2, &len);  
    strcat(buf, key2);

    // return dallas result
    return retval;


}


int getLicenseFromStubKey(const char *stub, char *buf) {

    unsigned char encrypt_key[129]="";
    char key[65], key2[65];
    unsigned long len = 0;
    int retval =0;

    // generate runtime key		
    // encrypt key sha256
    get_encrypt_key(encrypt_key);
    sha256string((char *) encrypt_key, key, &len);

    strcpy(buf, key);

    // sha256 stub key
    sha256string(stub, key2, &len);  
    strcat(buf, key2);

    // return dallas result
    return retval;

}


int getLicenseFromFile(const char *file, char *buf) {

    FILE *fp = 0;

    fp = fopen(file, "r");
    if(fp) {
    	fgets(buf, 129, fp);
        fclose(fp);
        chop(buf);
        return 0;
    }

    return -1;
}

int checkLicenseFromFile(const char *file) {

    char license_dallas[129];
    char license_file[129];

    getLicenseFromDallas(license_dallas);

    memset(license_file, 0, sizeof(license_file));
    getLicenseFromFile(file, license_file);

    return strcmp(license_dallas, license_file) ;
}

