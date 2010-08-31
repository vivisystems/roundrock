CC=gcc

default:	crypt-keygen decrypt-test

crypt-keygen:	keygen.c encrypt.h
		gcc -o crypt-keygen keygen.c

decrypt-test:	decrypt.o decrypt-test.o
#		gcc -o decrypt-test decrypt.o decrypt-test.o

decrypt-test.o:	decrypt-test.c
#		gcc -o decrypt-test.o -c decrypt-test.c

decrypt.o:	decrypt.c encrypt.h
#		gcc -o decrypt.o -c decrypt.c

clean:		
		rm -f crypt-keygen decrypt-test decrypt-test.o decrypt.o
