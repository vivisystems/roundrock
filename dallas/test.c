#include "dallas.h"

int main()
{

    unsigned char buf[8];
    unsigned char buf_hex[17];
    int result = 0;

    result = ow_read(buf);

    printf("result = %d , buf = %s \n" , result, buf);

    result = ow_read2hex(buf_hex);

    printf("result = %d , buf = %s \n" , result, buf_hex);
    
    return 0;
}

