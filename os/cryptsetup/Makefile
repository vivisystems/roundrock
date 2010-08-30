default:	crypt-keygen decrypt

crypt-keygen:	keygen.c encrypt.h
		gcc -o crypt-keygen keygen.c

decrypt:	decrypt.c encrypt.h
		gcc -o decrypt decrypt.c

clean:		
		rm -f crypt-keygen decrypt
