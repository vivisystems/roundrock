#include <sys/io.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char* argv[])
{

  // change I/O privilege level
  iopl(3);

  char board[10] = "";
  int i;

  if(argc <=1) strcpy(board, "tc3");
  else strcpy(board, argv[1]);

  if(strcmp(board, "tc3") == 0 ) {
    for(i=0; i <=5; i++) {
        cashdrawer_tc3();
        usleep(500000);
    }
  }
  else {
    for(i=0; i <=5; i++) {
        cashdrawer_4720();
        usleep(500000);
    }
  }
  return EXIT_SUCCESS;

}

int cashdrawer_tc3() {

  unsigned char ret ;

  outb(0x00,0x800);
  usleep(250000);
  outb(0xC0,0x800);

  ret = inb(0x800);

  return ((ret&0x20)>>5);
}

int cashdrawer_4720() {

  unsigned char ret ;

  // Enter Extended Function Mode
  outb(0x87,0x2e);
  outb(0x87,0x2e);

  // Assign Pin121-128 to be GPIO port 1 ?
  outb(0x2a, 0x2e);
  outb(0xff, 0x2f);

  // Select Logic Device 7
  outb(0x07,0x2e);
  outb(0x07,0x2f);

  // Active Logic Device 7 ?
  outb(0x30, 0x2e);
  outb(0x01, 0x2f);

  outb(0xf1,0x2e);
  outb(1, 0x2f);

  usleep(250000);


  ret = inb(0x2f);
  // printf("ret = %d\n", ((ret & 0x10)>>4), ret );
  outb(0, 0x2f);
  outb(0x08,0x48f);

  // Exit Extended Function Mode
  outb(0xAA, 0x2e);

  return ((ret & 0x10)>>4);

}
