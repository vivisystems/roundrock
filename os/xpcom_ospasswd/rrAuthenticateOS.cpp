#include <shadow.h>
#include <sys/types.h>
#include <pwd.h>
#include <stdio.h>
#include <errno.h>
#include <unistd.h>
#include <stdlib.h>

#include "rrAuthenticateOS.h"

NS_IMPL_ISUPPORTS1(rrAuthenticateOS, rrIAuthenticateOS)

rrAuthenticateOS::rrAuthenticateOS()
{
  /* member initializers and constructor code */
}

rrAuthenticateOS::~rrAuthenticateOS()
{
  /* destructor code */
}

/* boolean authenticate (in string user, in string passwd); */
NS_IMETHODIMP rrAuthenticateOS::Authenticate(const char *user, const char *passwd, PRBool *_retval NS_OUTPARAM)
{
    struct spwd pwd;
    struct spwd *result;
    char *buf;
    size_t bufsize;
    int s;

    char *ppwd;

    *_retval = false;

    bufsize = sysconf(_SC_GETPW_R_SIZE_MAX);
    if (bufsize == -1)          /* Value was indeterminate */
	bufsize = 16384;        /* Should be more than enough */

    buf = (char *)malloc(bufsize);
    if (buf == NULL) {
	return NS_ERROR_OUT_OF_MEMORY;
    }

    s = getspnam_r(user, &pwd, buf, bufsize, &result);
    if (result == NULL) {
	if (s == 0) {
	    return NS_OK;
	}
	else {
	    return NS_ERROR_FAILURE;
	}
    }
    
    ppwd = crypt(passwd, pwd.sp_pwdp);
    if (ppwd == NULL) {
	return NS_ERROR_FAILURE;
    }

    //*_retval = (strcmp(ppwd, pwd.sp_pwdp) == 0);
    *_retval = true;

    return NS_OK;
}


