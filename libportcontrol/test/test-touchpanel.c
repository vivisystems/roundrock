#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/time.h>
#include "portcontrol.h"
#include "portcontrol-serial.h"


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
    PortControlImpl impl = getSerPortControlImpl();
	// portControlInit();

	result = impl.openPort(port, port_attr);

    // printf("openPort %s %d \n", port, result);

	if (result != 0) return result;

    impl.hdwrResetDevice(port);
    impl.inputFlushPort(port);

    int timeout = 1000;
    int total_read_len = 0;

    while (timeout > 0) {

	    read_len = impl.readPort(port, read_buf, 8);

	    total_read_len+=read_len;
	    // printf("total_read_len %d \n", total_read_len);

        if (total_read_len > 16 )
        {
            timeout =0;
        }
        else {
            if (timeout > 20) timeout -= 20;
            else timeout = 0;
        }

        struct timeval sleepTime = {0, 20 * 1000};

        select(0, NULL, NULL, NULL, &sleepTime);

    }

//    printf("readPort %s %d \n", port, read_len);
    impl.inputFlushPort(port);
    impl.hdwrResetDevice(port);
	impl.closePort(port);


//	printf("writeLen = %d , readLen = %d \n", write_len, read_len);
    // release portControl
	// portControlDestroy();
	impl.releaseImpl();


	if (total_read_len > 0 ) return 0;
    else return 1;

	return EXIT_SUCCESS;
}
