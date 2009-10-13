################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../src/nsFilePortControlUnix.cpp \
../src/nsSerialPortControlUnix.cpp \
../src/nsParallelPortControlUnix.cpp \
../src/nsIOPortControlUnix.cpp \
../src/nsPortControlUnixModule.cpp


OBJS += \
./src/nsFilePortControlUnix.o \
./src/nsSerialPortControlUnix.o \
./src/nsParallelPortControlUnix.o \
./src/nsIOPortControlUnix.o \
./src/nsPortControlUnixModule.o


C_DEPS +=


# Each subdirectory must supply rules for building sources it contributes
src/%.o: ../src/%.cpp
	@echo 'Building file: $<'
	@echo 'Invoking: C Compiler'
	$(CXX) -c -O -fshort-wchar -fno-rtti -fno-exceptions -I"$(XULRUNNER_SDK)/include" -I"../../libportcontrol/src" -o"$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


