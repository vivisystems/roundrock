/* 
 * File:   mozFecMbInvoker.h
 * Author: rack
 *
 * Created on 2008年12月13日, 下午 2:22
 */

#ifndef _MOZFECMBINVOKER_H
#define	_MOZFECMBINVOKER_H

#include "mozIFECMbInvoker.h"

// 3f4fb408-55b0-459d-851c-88c424d6a2d0
#define MOZ_FECMBINVOKER_CID \
{ 0x3f4fb408, 0x55b0, 0x459d, \
  { 0x85, 0x1c, 0x88, 0xc4, 0x24, 0xd6, 0xa2, 0xd0 } }

#define mozFECMBINVOKERContractID "@firich.com.tw/mb-invoker;1"


class mozFECMbInvoker : public mozIFECMbInvoker
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_MOZIFECMBINVOKER

  mozFECMbInvoker();

private:
  ~mozFECMbInvoker();

protected:
  /* additional members */
};


#endif	/* _MOZFECMBINVOKER_H */

