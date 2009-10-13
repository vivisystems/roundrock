################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../src/portcontrol-file.c \
../src/portcontrol-parallel.c \
../src/portcontrol-serial.c \
../src/portcontrol.c


OBJS += \
./src/portcontrol-file.o \
./src/portcontrol-parallel.o \
./src/portcontrol-serial.o \
./src/portcontrol.o


C_DEPS += \
./src/portcontrol-file.d \
./src/portcontrol-parallel.d \
./src/portcontrol-serial.d \
./src/portcontrol.d


# Each subdirectory must supply rules for building sources it contributes
src/%.o: ../src/%.c
	@echo 'Building file: $<'
	@echo 'Invoking: Cygwin C Compiler'
	g++-4.2 -O2 -g -Wall -c -fmessage-length=0 -MMD -MP -MF"$(@:%.o=%.d)" -MT"$(@:%.o=%.d)" -o"$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


