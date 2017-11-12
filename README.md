[![Build Status](https://travis-ci.org/eslint/eslint.github.io.svg?branch=master)](https://travis-ci.org/eslint/eslint.github.io)

# ESLint Web Site

This contains the code running on [eslint.org](https://eslint.org).

## Pull Requests

Please note that all HTML documentation is split between this repository and the main [ESLint repository](https://github.com/eslint/eslint). Documentation for rules and APIs is located in the core repository, the rest is located in this repository. You can easily determine if original documentation file is native to website repository by checking for `<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->` comment just below the header of the markdown file. If that header is present, this file is located in the core ESLint repository and any pull requests should be sent there. Otherwise, file is native to this site repository and can be fixed by creating a pull request in this repository.

## How to add your company/project logo to the site

* Create a fork of this repository
* Clone it locally
* Create a new branch
* Add your logo image to `/img/logos/` directory. Logo should be at least 150px of height. Name your logo with your company/project name.
* Update `/_data/logos.yml` file and add an entry for your company with the name, url and src (should point to the logo you just added).
* Commit your changes to your fork and create a pull request into the main repository.

## Developer Setup

This repository runs on GitHub pages through Jekyll. To setup a local environment, please follow the [GitHub instruction](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/) (be sure to follow the instructions for your platform).

Once you have setup a local environment, you can run a copy of the website locally using this command:

```
$ npm start
```

## License

MIT
