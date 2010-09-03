#ifndef _MY_COMPONENT_H
#define _MY_COMPONENT_H

#include "rrIAuthenticateOS.h"

#define MYCOMPONENT_CONTRACTID "@vivisystems.com.tw/roundrock/authenticate-os;1"
#define MYCOMPONENT_CLASSNAME "Authentication against System Passwords"

#define	MYCOMPONENT_CID { 0x4fd8f839, 0x8514, 0x4a14, \
			  { 0x9a, 0xd8, 0xa4, 0xd6, 0x54, 0x1c, 0x4e, 0x66 }}


class rrAuthenticateOS : public rrIAuthenticateOS
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_RRIAUTHENTICATEOS

  rrAuthenticateOS();

private:
  ~rrAuthenticateOS();

protected:
  /* additional members */
};

#endif /*_MY_COMPONENT_H */
