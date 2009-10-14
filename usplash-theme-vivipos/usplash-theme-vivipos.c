/* usplash
 *
 * eft-theme.c - definition of eft theme
 *
 * Copyright © 2006 Dennis Kaarsemaker <dennis@kaarsemaker.net>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA
 */

#include <usplash-theme.h>
/* Needed for the custom drawing functions */
#include <usplash_backend.h>
extern struct usplash_pixmap pixmap_usplash_640_480;
extern struct usplash_pixmap pixmap_usplash_800_600, pixmap_usplash_1024_768;
extern struct usplash_pixmap pixmap_throbber_back;
extern struct usplash_pixmap pixmap_throbber_back_16;
extern struct usplash_pixmap pixmap_throbber_fore;
extern struct usplash_pixmap pixmap_throbber_fore_16;

void t_init(struct usplash_theme* theme);
void t_clear_progressbar(struct usplash_theme* theme);
void t_clear_progressbar_16(struct usplash_theme* theme);
void t_draw_progressbar(struct usplash_theme* theme, int percentage);
void t_draw_progressbar_16(struct usplash_theme* theme, int percentage);
void t_animate_step(struct usplash_theme* theme, int pulsating);
void t_animate_step_16(struct usplash_theme* theme, int pulsating);

struct usplash_theme usplash_theme_800_600;
struct usplash_theme usplash_theme_1024_768;

/* Theme definition */
struct usplash_theme usplash_theme = {
	.version = THEME_VERSION, /* ALWAYS set this to THEME_VERSION, 
                                 it's a compatibility check */
    .next = &usplash_theme_800_600,
    .ratio = USPLASH_4_3,

	/* Background and font */
	.pixmap = &pixmap_usplash_640_480,

	/* Palette indexes */
	.background             = 255,
  	.progressbar_background = 255,
  	.progressbar_foreground = 255,
	.text_background        = 255,
	.text_foreground        = 100,
	.text_success           = 100,
	.text_failure           = 95,

	/* Progress bar position and size in pixels */
  	.progressbar_x      = 165,
  	.progressbar_y      = 540,
  	.progressbar_width  = 253,
  	.progressbar_height = 9,

	/* Text box position and size in pixels */
  	.text_x      = 20,
  	.text_y      = 330,
  	.text_width  = 180,
  	.text_height = 20,

	/* Text details */
  	.line_height  = 15,
  	.line_length  = 32,
  	.status_width = 35,

    /* Functions */
    .init = t_init,
    .clear_progressbar = t_clear_progressbar,
    .draw_progressbar = t_draw_progressbar,
    .animate_step = t_animate_step,
};

struct usplash_theme usplash_theme_800_600 = {
	.version = THEME_VERSION, /* ALWAYS set this to THEME_VERSION, 
                                 it's a compatibility check */
    .next = &usplash_theme_1024_768,
    .ratio = USPLASH_4_3,

	/* Background and font */
	.pixmap = &pixmap_usplash_800_600,

	/* Palette indexes */
	.background             = 255,
  	.progressbar_background = 255,
  	.progressbar_foreground = 255,
	.text_background        = 255,
	.text_foreground        = 100,
	.text_success           = 100,
	.text_failure           = 95,

	/* Progress bar position and size in pixels */
  	.progressbar_x      = 271,
  	.progressbar_y      = 415,
  	.progressbar_width  = 245,
  	.progressbar_height = 14,

	/* Text box position and size in pixels */
  	.text_x      = 30,
  	.text_y      = 540,
  	.text_width  = 300,
  	.text_height = 30,

	/* Text details */
  	.line_height  = 15,
  	.line_length  = 32,
  	.status_width = 35,

    /* Functions */
    .init = t_init,
    .clear_progressbar = t_clear_progressbar,
    .draw_progressbar = t_draw_progressbar,
    .animate_step = t_animate_step,
};

struct usplash_theme usplash_theme_1024_768 = {
	.version = THEME_VERSION,
    .next = NULL,
    .ratio = USPLASH_4_3,

	/* Background and font */
	.pixmap = &pixmap_usplash_1024_768,

	/* Palette indexes */
	.background             = 255,
  	.progressbar_background = 255,
  	.progressbar_foreground = 255,
	.text_background        = 255,
	.text_foreground        = 100,
	.text_success           = 100,
	.text_failure           = 95,

	/* Progress bar position and size in pixels */
  	.progressbar_x      = 352,
  	.progressbar_y      = 540,
  	.progressbar_width  = 320,
  	.progressbar_height = 18,

	/* Text box position and size in pixels */
  	.text_x      = 40,
  	.text_y      = 700,
  	.text_width  = 400,
  	.text_height = 40,

	/* Text details */
  	.line_height  = 15,
  	.line_length  = 32,
  	.status_width = 35,

    /* Functions */
    .init = t_init,
    .clear_progressbar = t_clear_progressbar,
    .draw_progressbar = t_draw_progressbar,
    .animate_step = t_animate_step,
};

void t_init(struct usplash_theme *theme) {
    int x, y;
    usplash_getdimensions(&x, &y);
    theme->progressbar_x = (x - theme->pixmap->width)/2 + theme->progressbar_x;
    theme->progressbar_y = (y - theme->pixmap->height)/2 + theme->progressbar_y;
}

void t_clear_progressbar(struct usplash_theme *theme) {
    usplash_put(theme->progressbar_x, theme->progressbar_y, &pixmap_throbber_back);
}

void t_clear_progressbar_16(struct usplash_theme *theme) {
    usplash_put(theme->progressbar_x, theme->progressbar_y, &pixmap_throbber_back_16);
}

void t_draw_progressbar(struct usplash_theme *theme, int percentage) {
    int w = (pixmap_throbber_back.width * percentage / 100);
    if(percentage == 0)
        usplash_put(theme->progressbar_x, theme->progressbar_y, &pixmap_throbber_back);
    if(percentage < 0){/* Unloading */
        w *= -1;
        /* Draw background to left of foreground */
        usplash_put_part(theme->progressbar_x, theme->progressbar_y, w, pixmap_throbber_back.height, 
                         &pixmap_throbber_back, 0, 0);
        /* Draw foreground to right of background */
        usplash_put_part(theme->progressbar_x + w, theme->progressbar_y, pixmap_throbber_back.width - w,
                         pixmap_throbber_back.height, &pixmap_throbber_fore, w, 0);
    }
    else{/* Loading */
        /* Draw foreground to left of background */
        usplash_put_part(theme->progressbar_x, theme->progressbar_y, w, pixmap_throbber_back.height, 
                         &pixmap_throbber_fore, 0, 0);
        /* Draw background ot right of foreground */
        usplash_put_part(theme->progressbar_x + w, theme->progressbar_y, pixmap_throbber_back.width - w, pixmap_throbber_back.height, 
                         &pixmap_throbber_back, w, 0);
    }
}

void t_draw_progressbar_16(struct usplash_theme *theme, int percentage) {
    int w = (pixmap_throbber_back_16.width * percentage / 100);
    if (percentage == 0)
        usplash_put(theme->progressbar_x, theme->progressbar_y, &pixmap_throbber_back_16);
    if (percentage < 0){ /* Unloading */
        w *= -1;
        /* Draw background to left of foreground */
        usplash_put_part(theme->progressbar_x, theme->progressbar_y, w, pixmap_throbber_back_16.height, 
                         &pixmap_throbber_back_16, 0, 0);
        /* Draw foreground to right of background */
        usplash_put_part(theme->progressbar_x + w, theme->progressbar_y, pixmap_throbber_back_16.width - w,
                         pixmap_throbber_back_16.height, &pixmap_throbber_fore_16, w, 0);
    }
    else{/* Loading */
        /* Draw foreground to left of background */
        usplash_put_part(theme->progressbar_x, theme->progressbar_y, w, pixmap_throbber_back_16.height, 
                         &pixmap_throbber_fore_16, 0, 0);
        /* Draw background to right of foreground */
        usplash_put_part(theme->progressbar_x + w, theme->progressbar_y, pixmap_throbber_back_16.width - w, pixmap_throbber_back_16.height, 
                         &pixmap_throbber_back_16, w, 0);
    }
}

void t_animate_step(struct usplash_theme* theme, int pulsating) {

    static int pulsate_step = 0;
    static int pulse_width = 56;
    static int step_width = 2;
    static int num_steps = 0;
    int x1;
    int x2;
    num_steps = (pixmap_throbber_fore.width - pulse_width)/2;

    if (pulsating) {
        if(pulsate_step < num_steps/2+1){
	        x1 = 2 * step_width * pulsate_step;
        }
        else{
	        x1 = pixmap_throbber_fore.width - pulse_width - 2 * step_width * (pulsate_step - num_steps/2+1);
        }
        x2 = x1 + pulse_width;

        /* Draw progress bar background on left side of foreground 'pulse' */
        usplash_put_part(theme->progressbar_x, theme->progressbar_y, x1,
                         pixmap_throbber_back.height, &pixmap_throbber_back, 0, 0);
        /* Draw progress bar foreground 'pulse' */
        usplash_put_part(theme->progressbar_x + x1, theme->progressbar_y, pulse_width,
                         pixmap_throbber_back.height, &pixmap_throbber_fore, x1, 0);
        /* Draw progress bar background on right side of foreground 'pulse' */
        usplash_put_part(theme->progressbar_x + x2, theme->progressbar_y, pixmap_throbber_back.width - x2,
                         pixmap_throbber_back.height, &pixmap_throbber_back, x2, 0);

        pulsate_step = (pulsate_step + 1) % num_steps;
    }
}

void t_animate_step_16(struct usplash_theme* theme, int pulsating) {

    static int pulsate_step = 0;
    static int pulse_width = 28;
    static int step_width = 2;
    static int num_steps = 0;
    int x1;
    int x2;
    num_steps = (pixmap_throbber_fore.width - pulse_width)/2;

    if (pulsating) {
        if(pulsate_step < num_steps/2+1){
	        x1 = 2 * step_width * pulsate_step;
        }
        else{
            x1 = pixmap_throbber_fore_16.width - pulse_width - 2 * step_width * (pulsate_step - num_steps/2+1);
        }
        x2 = x1 + pulse_width;

        /* Draw progress bar background on left side of foreground 'pulse' */
        usplash_put_part(theme->progressbar_x, theme->progressbar_y, x1,
                         pixmap_throbber_back_16.height, &pixmap_throbber_back_16, 0, 0);
        /* Draw progress bar foreground 'pulse' */
        usplash_put_part(theme->progressbar_x + x1, theme->progressbar_y, pulse_width,
                         pixmap_throbber_back_16.height, &pixmap_throbber_fore_16, x1, 0);
        /* Draw progress bar background on right side of foreground 'pulse' */
        usplash_put_part(theme->progressbar_x + x2, theme->progressbar_y, pixmap_throbber_back_16.width - x2,
                         pixmap_throbber_back_16.height, &pixmap_throbber_back_16, x2, 0);

        pulsate_step = (pulsate_step + 1) % num_steps;
    }
}
