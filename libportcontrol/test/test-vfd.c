#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "portcontrol.h"



int main(int argc, char* argv[]) {

    int result = 1;
    int write_len=0, read_len=0;
    char port[80] ="";
    char port_attr[80] ="";
    char read_buf[5] = "";


    if (argc >=2) {
        strcpy(port, argv[1]);
        strcpy(port_attr, "9600,n,8,1,n");
    }

    if(argc >= 3){
        strcpy(port_attr, argv[2]);
    }

    // initial portControl
	portControlInit();

	result = openPort(port, port_attr);

    // printf("openPort %s %d \n", port, result);

	if (result != 0) return result;

    char cmd_clear[2] = {0x0c, 0x00};
    write_len = writePort(port, cmd_clear, 1);

    // send Line1
    write_len = writePort(port, "Welcome! FEC!", strlen("Welcome! FEC!"));

    // cursor down
    char cmd_down[3] = {0x0b, 0x0a, 0x00};
    writePort(port, cmd_down, 2);

    // send Line2
    write_len = writePort(port, "Customer Display!", strlen("Customer Display!"));


	closePort(port);


//	printf("writeLen = %d , readLen = %d \n", write_len, read_len);
    // release portControl
	portControlDestroy();


	if (write_len > 0) return 0;
    else return 1;

	return EXIT_SUCCESS;
}
