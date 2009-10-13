#include <stdio.h>
#include <stdlib.h>
#include "portcontrol.h"
#include "portcontrol-error.h"
#include "portcontrol-structures.h"
#include "portcontrol-file.h"
#include "portcontrol-parallel.h"
#include "portcontrol-serial.h"

static PortControlImpl impls[NUM_IMPLS];
static char isInit = 0;

static long getSupportingImplIdx(char const * portName)
{

    if (impls[SER_IMPL_IDX].matchPortName(portName) == PORTCONTROL_ERROR_SUCCESS) return SER_IMPL_IDX;
    if (impls[PAR_IMPL_IDX].matchPortName(portName) == PORTCONTROL_ERROR_SUCCESS) return PAR_IMPL_IDX;
    if (impls[FILE_IMPL_IDX].matchPortName(portName) == PORTCONTROL_ERROR_SUCCESS) return FILE_IMPL_IDX;
    return PORTCONTROL_ERROR_NOT_AVAILABLE;
}


void portControlInit(void) {
	if(isInit == 0) {
		impls[SER_IMPL_IDX] = getSerPortControlImpl();
		impls[PAR_IMPL_IDX] = getParPortControlImpl();
		impls[FILE_IMPL_IDX] = getFileControlImpl();
		isInit = 1;
	}
}

void portControlDestroy(void) {
	if(isInit == 1) {
		impls[SER_IMPL_IDX].releaseImpl();
		impls[PAR_IMPL_IDX].releaseImpl();
		impls[FILE_IMPL_IDX].releaseImpl();
		isInit = 0;
	}
}

long openPort (char const * portName, char const * portSettings)
{
    long supportingImplIdx = getSupportingImplIdx(portName);
    if (supportingImplIdx == PORTCONTROL_ERROR_NOT_AVAILABLE)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    if (impls[supportingImplIdx].openPort == 0)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    return impls[supportingImplIdx].openPort(portName, portSettings);
}

long writePort (char const * portName, char const * writeBuffer, long length)
{
    long supportingImplIdx = getSupportingImplIdx(portName);
    if (supportingImplIdx == PORTCONTROL_ERROR_NOT_AVAILABLE)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    if (impls[supportingImplIdx].writePort == 0)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    return impls[supportingImplIdx].writePort(portName, writeBuffer, length);
}

long readPort (char const * portName, char * readBuffer, long length)
{
    long supportingImplIdx = getSupportingImplIdx(portName);

    if (supportingImplIdx == PORTCONTROL_ERROR_NOT_AVAILABLE)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    if (impls[supportingImplIdx].readPort == 0)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    return impls[supportingImplIdx].readPort(portName, readBuffer, length);
}

int statusPort (const char * portName)
{
    long supportingImplIdx = getSupportingImplIdx(portName);
    if (supportingImplIdx == PORTCONTROL_ERROR_NOT_AVAILABLE)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    return impls[supportingImplIdx].statusPort(portName);
}


long hdwrResetDevice (char const * portName)
{
    long supportingImplIdx = getSupportingImplIdx(portName);
    if (supportingImplIdx == PORTCONTROL_ERROR_NOT_AVAILABLE)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    if (impls[supportingImplIdx].hdwrResetDevice == 0)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    return impls[supportingImplIdx].hdwrResetDevice(portName);
}


long closePort (char const * portName)
{
    long supportingImplIdx = getSupportingImplIdx(portName);
    if (supportingImplIdx == PORTCONTROL_ERROR_NOT_AVAILABLE)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    if (impls[supportingImplIdx].closePort == 0)
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    return impls[supportingImplIdx].closePort(portName);
}

