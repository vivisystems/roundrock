default:	sign decrypt

sign:		sign.c encrypt.h
		gcc -o sign sign.c

decrypt:	decrypt.c encrypt.h
		gcc -o decrypt decrypt.c

clean:		
		rm -f sign decrypt
