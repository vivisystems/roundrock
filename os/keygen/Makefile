CC	= gcc
CFLAGS	= -O2
SOURCES	= crypt-keygen.c decrypt.c decrypt-test.c
OBJECTS	= crypt-keygen.o decrypt.o decrypt-test.o
BINARIES= crypt-keygen decrypt-test

default:	crypt-keygen decrypt-test

.c.o:		
		$(CC) $(CFLAGS) -c $<

$(OBJECTS):	encrypt.h

crypt-keygen:	crypt-keygen.o

decrypt-test:	decrypt.o decrypt-test.o

clean:		
		rm -f $(BINARIES) $(OBJECTS)
