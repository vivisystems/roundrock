################################################################################
# Automatically-generated file. Do not edit!
################################################################################

-include ../makefile.init

RM := rm -fr
CC := gcc-4.2
CXX := g++-4.2
#XULRUNNER_SDK := /home/rack/gecko-sdk
# XULRUNNER_SDK := /usr/lib/xulrunner/sdk
XULRUNNER_SDK := /home/rack/workspace/xulrunner-sdk/1.9.0.10/xulrunner-sdk/sdk

# All of the sources participating in the build are defined here
-include sources.mk
-include subdir.mk
-include src/subdir.mk
-include objects.mk

ifneq ($(MAKECMDGOALS),clean)
ifneq ($(strip $(C_DEPS)),)
-include $(C_DEPS)
endif
endif

-include ../makefile.defs

# Add inputs and outputs from these tool invocations to the build variables 

# All Target
all: fec_portcontrol.so

# Tool invocations
fec_portcontrol.so: $(OBJS) $(USER_OBJS)
	@echo 'Building target: $@'
	@echo 'Invoking: Cygwin C Linker'
	$(CXX) -Os -o"fec_portcontrol.so" -shared -fno-rtti -fno-exceptions $(OBJS) $(USER_OBJS) $(LIBS) -L ./
	@echo 'Invoking: strip'
	strip "fec_portcontrol.so"
	@echo 'Finished building target: $@'
	@echo ' '

# Other Targets
clean:
	-$(RM) $(OBJS)$(EXECUTABLES)$(C_DEPS) fec_portcontrol.so
	-@echo ' '

.PHONY: all clean dependents
.SECONDARY:

-include ../makefile.targets
