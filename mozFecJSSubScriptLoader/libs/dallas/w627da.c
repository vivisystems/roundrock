#include "dallas.h"

#include "w627gpio.h"

#define _OW_TIME_OUT 30

static unsigned char gpio_port = GPIO_13; //GPIO_57;

static unsigned char dscrc_table[] = {
        0, 94,188,226, 97, 63,221,131,194,156,126, 32,163,253, 31, 65,
      157,195, 33,127,252,162, 64, 30, 95,  1,227,189, 62, 96,130,220,
       35,125,159,193, 66, 28,254,160,225,191, 93,  3,128,222, 60, 98,
      190,224,  2, 92,223,129, 99, 61,124, 34,192,158, 29, 67,161,255,
       70, 24,250,164, 39,121,155,197,132,218, 56,102,229,187, 89,  7,
      219,133,103, 57,186,228,  6, 88, 25, 71,165,251,120, 38,196,154,
      101, 59,217,135,  4, 90,184,230,167,249, 27, 69,198,152,122, 36,
      248,166, 68, 26,153,199, 37,123, 58,100,134,216, 91,  5,231,185,
      140,210, 48,110,237,179, 81, 15, 78, 16,242,172, 47,113,147,205,
       17, 79,173,243,112, 46,204,146,211,141,111, 49,178,236, 14, 80,
      175,241, 19, 77,206,144,114, 44,109, 51,209,143, 12, 82,176,238,
       50,108,142,208, 83, 13,239,177,240,174, 76, 18,145,207, 45,115,
      202,148,118, 40,171,245, 23, 73,  8, 86,180,234,105, 55,213,139,
       87,  9,235,181, 54,104,138,212,149,203, 41,119,244,170, 72, 22,
      233,183, 85, 11,136,214, 52,106, 43,117,151,201, 74, 20,246,168,
      116, 42,200,150, 21, 75,169,247,182,232, 10, 84,215,137,107, 53};

/* Calculate CRC-8 value
 * The CCITT-8 polynomial, expressed as X^8 + X^5 + X^4 + 1
 */
unsigned char ow_crc8(unsigned char *buf, int n)
{
    unsigned char crc;
    int i;

    crc = 0;
    for(i=0; i<n; i++) {
        crc = dscrc_table[crc ^ buf[i]];
    }
    return crc;
}



inline void outportb( int baseport, unsigned char b)
{
//  if(ioperm(baseport,1,1)){perror("ioperm");exit(1);}
  outb(b,baseport);
//  if(ioperm(baseport,1,0)){perror("ioperm");exit(1);}

}

inline unsigned char inportb(int baseport)
{
//  if(ioperm(baseport,1,1)){perror("ioperm");exit(1);}
  unsigned char b = inb(baseport);
//  if(ioperm(baseport,1,0)){perror("ioperm");exit(1);}
  return b;
}

inline void
xuusleep (double useconds)
{
  struct timespec ts_sleep;

  ts_sleep.tv_sec = 0;
  ts_sleep.tv_nsec = useconds*500;

  nanosleep (&ts_sleep, NULL) ;
}


inline void uusleep(int usecs) {
struct timeval tpstart,tpend;

  gettimeofday(&tpstart,NULL);
  long ss = tpstart.tv_sec*1000000 + tpstart.tv_usec + usecs;
//  printf("start time...ss: %l\n",  ss);

  while(1) {
	gettimeofday(&tpend,NULL);
	if( (tpend.tv_sec*1000000 + tpend.tv_usec) >= ss) break;
  }
}

inline unsigned char ow_reset(void)
{
    unsigned char rb;

//    if (iopl(3) != 0) return -1;
//    Superio_Enter_Config();
//    pgW627(gpio_port);

    // gp22 out
    SetForwardDirection(gpio_port);

    SetGPIO(gpio_port, 1);
//    uusleep(100);
    SetGPIO(gpio_port, 0);
    // usleep(480*10);
    uusleep(480);
    SetGPIO(gpio_port, 1);
    uusleep(70);

    // gp22 in
    SetBackwardDirection(gpio_port);
//     outportb(SUPERIO_GPIO_PORT+GPIOOffsetTable[GPIO_45], 0x85);
    GetGPIO(gpio_port, &rb);
    uusleep(410);

    return rb;
}

inline unsigned char ow_get()
{
    unsigned char b;

    // gp45 out
    SetForwardDirection(gpio_port);
    SetGPIO(gpio_port, 0);
//    uusleep(
    SetGPIO(gpio_port, 1);
    uusleep(10);

    SetBackwardDirection(gpio_port);

    GetGPIO(gpio_port, &b);
    uusleep(45);

//printf("b = %d ,",b);
    return b;
}


inline void ow_set(unsigned char d)
{
    if (d==0) {
        /* 0 */
        SetGPIO(gpio_port, 0);
        uusleep(80);
        SetGPIO(gpio_port, 1);
        uusleep(10);
    } else {
        /* 1 */
        SetGPIO(gpio_port, 0);
            uusleep(10);
        SetGPIO(gpio_port, 1);
        uusleep(80);
    }
}

inline void ow_write_0f(void)
{
    // gp45 out
    SetForwardDirection(gpio_port);

    /* 00001111 */
    ow_set(1); // bit0
    ow_set(1);
    ow_set(1);
    ow_set(1);
    ow_set(0);
    ow_set(0);
    ow_set(0);
    ow_set(0); // bit7
}

inline unsigned char ow_readbyte(void)
{
    unsigned char rb;
    int i;

    rb = 0;
    for(i=0; i<8; i++) {
    	rb >>= 1;
    	if (ow_get()) rb |= 0x80;
    }
    return rb;
}

int ow_init(void)
{
    // get gpio port
    if (iopl(3) != 0) return -1;
    // set gpio
    //
    Superio_Enter_Config();
    pgW627(gpio_port);
    // ow_set(1);
    return ow_reset();
}

int ow_close(void)
{
    if (iopl(3) != 0) return -1;

    Superio_Exit_Config();
    return 0;
}

int ow_read8crc(unsigned char *buf)
{
    int i;

    if (ow_reset()==1) return -1;

    ow_write_0f();

    for(i=0; i<8; i++) {
        buf[i] = ow_readbyte();
//        printf("(%02X) ", buf[i]);
    }

    // if (ow_crc8(buf, 7) != buf[7]) return 1;
    if (ow_crc8(buf, 7) != buf[7]) {
//      printf("crc error! retry...\n");
      return 1;
    }

    return 0;
}

int ow_read(unsigned char *buf) {

    int result = 0;
    int i_time_out = 0;

    memset(buf, 0, 8);

    switch(ow_init()) {
        case -1:
	    // gpio error
	    result = -1;
            break;
	case 0:
	    // reset ok            result = 0;
	    break;
	case 1:
        default:
	    // no chip found
            result = -2;
	    break;
    }

    if (result == 0) {
	    while(ow_read8crc(buf)) {
                if (++i_time_out == _OW_TIME_OUT) break;
                // delay for reinit
                uusleep(100000);
            }

	    if (i_time_out == _OW_TIME_OUT) {
		printf("reading dallas timeout\n");
		result = -3;
	    }
    }
    ow_close();

    return result;

}


int ow_read2hex(char *buf) {
    
    int result = 0;
    unsigned char bin_buf[8];

    memset(buf, 0, 17);  // 16 bytes of strings

    result = ow_read(bin_buf);
 
//    if (result == 0) {

	sprintf(buf, "%02x%02x%02x%02x%02x%02x%02x%02x", 
		bin_buf[0], bin_buf[1], bin_buf[2], bin_buf[3],
		bin_buf[4], bin_buf[5], bin_buf[6], bin_buf[7]);

//    }

    return result;

}

////////////////////////////////////////////////////////////////////////////////
inline void SetForwardDirection(GPIO_TYPE pin)
{
    unsigned char gpio_state = 0;

    Superio_Get_Reg(GPIO_IO_REG[pin], &gpio_state);

    if(pin >7) pin -= 8;
    
    gpio_state &= ~(0x01 << pin);

    outportb(SUPERIO_CONFIG_PORT+1, gpio_state);


}

////////////////////////////////////////////////////////////////////////////////
inline void SetBackwardDirection(GPIO_TYPE pin)
{

    unsigned char gpio_state = 0;

    Superio_Get_Reg(GPIO_IO_REG[pin], &gpio_state);

    if(pin >7) pin -= 8;

    gpio_state |= (0x01 << pin);

    outportb(SUPERIO_CONFIG_PORT+1, gpio_state);

}

////////////////////////////////////////////////////////////////////////////////
inline void SetGPIO(GPIO_TYPE pin, unsigned char high_low)
{

        unsigned char gpio_data = 0;

        Superio_Get_Reg(GPIO_DATA_REG[pin], &gpio_data);

        if(pin >7) pin -= 8;
        
        if (high_low) {
            gpio_data |= (0x01 << pin);
        } else {
            gpio_data &= ~(0x01 << pin);
        }

        outportb(SUPERIO_CONFIG_PORT+1, gpio_data);

}

////////////////////////////////////////////////////////////////////////////////
inline void GetGPIO(GPIO_TYPE pin, unsigned char *gpio_state)
{

    unsigned char gpio_data = 0;

    Superio_Get_Reg(GPIO_DATA_REG[pin], &gpio_data);
    if(pin >7) pin -= 8;
    
    gpio_data &= (0x01 << pin);

    *gpio_state = (gpio_data >> pin);

}


////////////////////////////////////////////////////////////////////////////////
void pgW627(GPIO_TYPE pin)
{
   unsigned char gpio_state = 0;
   Set_Logical_Device(pin);
   
   unsigned char gpio_active = GPIO_ACTIVE[pin];

   // active
   Superio_Get_Reg(0x30, &gpio_state);

   gpio_state |= gpio_active;

   outportb(SUPERIO_CONFIG_PORT+1, gpio_state);

}

////////////////////////////////////////////////////////////////////////////////
void Set_Logical_Device(GPIO_TYPE pin)
{
    Superio_Set_Reg(0x07, GPIO_LOGICIAL_DEVICE[pin]);
}

////////////////////////////////////////////////////////////////////////////////
inline void Superio_Get_Reg(unsigned char reg_index, unsigned char *reg_value)
{
    unsigned char get_value = 0;

    outportb(SUPERIO_CONFIG_PORT, reg_index);
    get_value = inportb(SUPERIO_CONFIG_PORT+1);

    *reg_value = get_value;
}

////////////////////////////////////////////////////////////////////////////////
inline void Superio_Set_Reg(unsigned char reg_index, unsigned char reg_value)
{
    outportb(SUPERIO_CONFIG_PORT, reg_index);
    outportb(SUPERIO_CONFIG_PORT+1, reg_value);
}

////////////////////////////////////////////////////////////////////////////////
void Superio_Enter_Config()
{
   outportb(SUPERIO_CONFIG_PORT, 0x87);
   outportb(SUPERIO_CONFIG_PORT, 0x87);
}

////////////////////////////////////////////////////////////////////////////////
void Superio_Exit_Config()
{
    outportb(SUPERIO_CONFIG_PORT, 0xAA);
}
