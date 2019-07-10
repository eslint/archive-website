# Netlify sets the following environment variables
# https://www.netlify.com/docs/continuous-deployment/#environment-variables
DEPLOY_URL = (ENV['CONTEXT'].eql? 'production') ? ENV['URL'] : ENV['DEPLOY_PRIME_URL']

# This is for backwards compatibility for the version currently deployed with GitHub Pages
DEFAULT_URL = 'https://eslint.org'

module Jekyll
    class EnvironmentVariablesGenerator < Generator
        def generate(site)
            site.config['url'] = DEPLOY_URL || DEFAULT_URL
        end
    end
end
