#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
// #include "portcontrol-file.h"
#include "portcontrol.h"

int main() {

	char *file = "/tmp/test1.txt";
	//PortControlImpl portImp = getFileControlImpl();
	//printf("openPort %d \n", portImp.openPort(file, "ttt"));
	//portImp.writePort(file, "TEST", 4);
	//portImp.closePort(file);

	portControlInit();
	int rv = openPort(file, "");
	if (rv != 0) return rv;

	printf("openPort %d \n", rv);
	long length = availablePort(file);
    printf("available = %d \n", length);
	writePort(file, "TEST", 4);
	closePort(file);
	portControlDestroy();


	return EXIT_SUCCESS;
}
