PRODUCTION_URL = 'https://eslint.org'
DEPLOYMENT_PREVIEW_URL = ENV['DEPLOY_PRIME_URL']

module Jekyll
    class EnvironmentVariablesGenerator < Generator
        def generate(site)
            site.config['url'] = DEPLOYMENT_PREVIEW_URL || PRODUCTION_URL
        end
    end
end
