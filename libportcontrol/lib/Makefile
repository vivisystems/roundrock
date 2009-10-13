################################################################################
# Automatically-generated file. Do not edit!
################################################################################

-include ../makefile.init

RM := rm -fr

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
all: libportcontrol.a

# Tool invocations
libportcontrol.a: $(OBJS) $(USER_OBJS)
	@echo 'Building target: $@'
	#@echo 'Invoking: Cygwin C Linker'
	#gcc  -o"libportcontrol.o" $(OBJS) $(USER_OBJS) $(LIBS)
	#@echo 'Invoking: Archive'
	ar -r "libportcontrol.a" $(OBJS) $(USER_OBJS)
	@echo 'Finished building target: $@'
	@echo ' '

# Other Targets
clean:
	-$(RM) $(OBJS)$(EXECUTABLES)$(C_DEPS) libportcontrol.o libportcontrol.a
	-@echo ' '

.PHONY: all clean dependents
.SECONDARY:

-include ../makefile.targets
