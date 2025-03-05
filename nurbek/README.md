# Telegram Information System

This is a simple system for displaying user information cards in a Telegram WebApp. It uses a JSON database to store user data and allows creating new entries.

## Features

- Display user information with custom animations
- Create new user entries through a form
- Store data in a JSON database
- Preview entries before saving
- Responsive design that works well in Telegram WebApp

## Files

- `index.html` - Main display page that shows user information
- `create.html` - Form for creating new user entries
- `script.js` - JavaScript for the main page
- `create.js` - JavaScript for the creation form
- `styles.css` - Styling for both pages
- `database.json` - JSON database storing all user entries
- `save_data.php` - PHP script for saving data to the database

## How to Use

### Viewing User Information

1. Open `index.html` in a Telegram WebApp
2. By default, it shows the first user in the database
3. To view a specific user, add `?id=X` to the URL, where X is the user ID

### Creating New Entries

1. Open `create.html` in a Telegram WebApp
2. Fill in the form with the user's information
3. You can preview the entry before saving
4. Click "Save" to add the entry to the database

### URL Parameters

- `id` - Specifies which user to display (e.g., `index.html?id=2`)
- `tgs` - Specifies a custom animation file (e.g., `index.html?tgs=custom.json`)

## Requirements

- Web server with PHP support for saving data
- Telegram WebApp environment

## Setup

1. Upload all files to your web server
2. Make sure the server has write permissions for `database.json`
3. Access the pages through Telegram WebApp

## Notes

- The default animation is `8_BROKEN_OUT.json`
- If a user doesn't specify an animation, the default will be used
- Views are formatted according to Russian locale (e.g., "922 056") 