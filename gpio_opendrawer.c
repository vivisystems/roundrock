#ifdef DJGPP
// dos djgpp
#include <io.h>
#include <pc.h>
#else
// linux
#include <sys/io.h>
#endif
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[])
{
  unsigned char ret;
  int status;
  int i, times=2;

  if (argc >1) {
     times = atoi(argv[1]);
  }

  if (times >4) times = 4 ;

//  printf("i = %d \n", i);

  // change I/O privilege level
  #ifndef DJGPP
  status = iopl(3);
  #endif

//  printf("ret = %d \n", status);
 
  if (status !=0 ) exit(status);


  // Enter Extended Function Mode
  outb(0x87,0x2e);
  outb(0x87,0x2e);

  // Assign Pin121-128 to be GPIO port 1 ?
//  outb(0x2a, 0x2e);
//  outb(0xff, 0x2f);

  // Select Logic Device 7
  outb(0x07,0x2e);
  outb(0x07,0x2f);

  // Active Logic Device 7 ?
//  outb(0x30, 0x2e);
//  outb(0x01, 0x2f);

  outb(0xf1,0x2e);

// pulse 2 times
  for (i=0; i < times; i++) {
	  outb(1, 0x2f);
	  usleep(250000);
	  outb(0, 0x2f);
	  usleep(250000);
  }

  ret = inb(0x2f);
  status = ((ret & 0x10)>>4);

//  outb(0x08,0x48f);
  // Exit Extended Function Mode
  outb(0xAA, 0x2e);

  exit(status);

}

