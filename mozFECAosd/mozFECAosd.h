/* 
 * File:   mozFecAosd.h
 * Author: rack
 *
 * Created on 2008年12月13日, 下午 2:22
 */

#ifndef _MOZFECAOSD_H
#define	_MOZFECAOSD_H

#include "mozIFECAosd.h"

// d1a7deb4-725a-41d0-8b94-e8873a656dc6
#define MOZ_FECAOSD_CID \
{ 0xd1a7deb4, 0x725a, 0x41d0, \
  { 0x8b, 0x94, 0xe8, 0x87, 0x3a, 0x65, 0x6d, 0xc6 } }

#define mozFECAOSDContractID "@firich.com.tw/aosd;1"


class mozFECAosd : public mozIFECAosd
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_MOZIFECAOSD

  mozFECAosd();

private:
  ~mozFECAosd();

protected:
  /* additional members */
};


#endif	/* _MOZFECAOSD_H */

