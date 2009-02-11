/* test the multi helpers... */
#include <tomcrypt.h>


static inline md5string (const char *src, char *dest, unsigned long *len) {


   unsigned long i;
   unsigned char buf[MAXBLOCKSIZE];
   char tmp[] ="00";

   *len = sizeof(buf);
   memset(dest, 0, sizeof(dest));

   hash_memory(find_hash("md5"), (unsigned char*) src, strlen(src), buf, len);

   for (i=0; i< *len; i++) {
       sprintf(tmp, "%02x", buf[i]);
       strcat(dest, tmp);
   }
}


int main(void)
{
   unsigned char key[16], buf[MAXBLOCKSIZE];
   unsigned long len, len2;
   int hash_idx;

/* register algos */
   register_hash(&sha256_desc);
   register_cipher(&aes_desc);
   register_hash (&md5_desc);
   register_hash (&sha1_desc);

   unsigned char hash_buffer[MAXBLOCKSIZE];


   hash_idx = find_hash("md5");
   if (hash_idx == -1) {
      printf("SHA256 not found...?\n");
      exit(-1);
   }

   len = sizeof(buf);

   hash_memory(hash_idx, (unsigned char*)"rack", 4, buf, &len);

   printf("len = %ld , buf = %02x%02x%02x%02x \n" , len, buf[0],buf[1],buf[2],buf[3]);

   md5string("rack", buf, &len);

	
   printf("len = %ld , buf = %s \n" , len, buf);

   return EXIT_SUCCESS;
}


/* $Source: /cvs/libtom/libtomcrypt/demos/multi.c,v $ */
/* $Revision: 1.3 $ */
/* $Date: 2006/06/07 22:25:09 $ */
