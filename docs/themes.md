-------------------------------------------------------------------------------
DELITE Themes
-------------------------------------------------------------------------------

Delite provides platform-specific themes for Android, iOS, Blackberry, and Windows 8.
There is also a generic theme named "bootstrap", and an example theme template called "custom".

All themes are generated using the Less CSS library (http://lesscss.org/).

Building themes
---------------

1. Install Node.js (http://nodejs.org/). 

2. "npm install"

3. "grunt"


Creating a new theme from the Custom theme
------------------------------------------     

The 'custom' theme (i.e. themes/custom folders) is a generic grey theme.
It is a good starting point for creating a new theme. All colors of this theme
are derived from 2 colors defined at the beginning of themes/custom/variables.less.

To create a new theme, you can change these colors (i.e. @lightColor and @darkColor)
as well as other part of variables.less and then run the compile script.
