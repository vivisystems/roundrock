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



	write_len = writePort(port, "TEST", 4);

	// printf("writePort %s %d \n", port, write_len);

	read_len = readPort(port, read_buf, 4);

    // printf("readPort %s %d \n", port, read_len);

	closePort(port);


//	printf("writeLen = %d , readLen = %d \n", write_len, read_len);
    // release portControl
	portControlDestroy();


	if (read_len == write_len) return 0;
    else return 1;

	return EXIT_SUCCESS;
}