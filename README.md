#amazing project

[![Build Status](https://travis-ci.org/eslint/website.svg?branch=master)](https://travis-ci.org/eslint/website)
[![Netlify Status](https://api.netlify.com/api/v1/badges/cefb59aa-729a-4f8e-be36-b981fda399c0/deploy-status)](https://app.netlify.com/sites/eslint/deploys)

# ESLint Web Site

This contains the code running on [eslint.org](https://eslint.org).

## Pull Requests

Please note that all HTML documentation is split between this repository and the main [ESLint repository](https://github.com/eslint/eslint). Documentation for rules and APIs is located in the core repository, the rest is located in this repository. You can easily determine if original documentation file is native to website repository by checking for `<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->` comment just below the header of the markdown file. If that header is present, this file is located in the core ESLint repository and any pull requests should be sent there. Otherwise, file is native to this site repository and can be fixed by creating a pull request in this repository.

## How to add your company/project logo to the site

* Create a fork of this repository.
* Clone it locally.
* Create a new branch.
* Add your logo image to `/assets/img/logos/` directory. Logo should be at least 150px of height. Name your logo with your company/project name.
* Update `/_data/logos.yml` file and add an entry for your company with the name, url and src (should point to the logo you just added).
* Commit your changes to your fork and create a pull request into the main repository.

## Developer Setup

This website is built with [Eleventy](https://www.11ty.io) and is hosted on [Netlify](https://www.netlify.com).

### Local development

To set up a local development environment, install [Node.js](https://nodejs.org/) (be sure to follow the instructions for your platform) and follow the steps below:

```sh
# Clone the repository
git clone git@github.com:eslint/website.git eslint-website

# Navigate to the root directory
cd eslint-website

# Install dependencies
npm install
```

Once you have set up your environment, you can run a copy of the website locally using this command:

```sh
$ npm start
```

This will watch for changes to the source code and rebuild the website, which will be hosted at `http://localhost:8080/`.

## License

[MIT License](LICENSE)
