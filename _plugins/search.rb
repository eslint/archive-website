class AlgoliaSearchRecordExtractor
  def custom_hook_each(item, node)
    EslintCustomSearchHelper.hook_each(item, node)
  end
end

class EslintCustomSearchHelper
  def self.hook_each(item, node)
    return nil if excluded_page(item)

    record = {
      weight: item[:weight],
      tag_name: item[:tag_name]
    }

    # Grabbing information on the position of the record in the page hierarchy
    hierarchy_info = hierarchy_info(item)
    return nil if excluded_item(item, hierarchy_info)
    record = record.merge(hierarchy_info)

    # We store the content in `title` for the headings and in `text` for the
    # other nodes
    if heading?(item[:tag_name])
      record[:title] = item[:text].gsub('"', '')
      record[:text] = nil
    else
      record[:title] = nil
      record[:text] = item[:text]
    end

    # We find the url to get to this content
    record[:url] = url(item, record)

    record
  end

  # Items from pages we do not want to index
  def self.excluded_page(item)
    # Blog posts are mostly changelogs
    return true if blog?(item)
    # This pages should not be indexed, they do not contain any interesting data
    return true if item[:url] == '/blog/index.html'
    return true if item[:url] == '/cla/index.html'
    return true if item[:url] == '/demo/index.html'
    return true if item[:url] == '/docs/rules/index.html'
    return true if item[:url] == '/docs/user-guide/integrations/index.html'
    return true if item[:url] == '/index.html'
    return true if item[:url] == '/parser/index.html'
    # Only index the latest doc, not the one with a specific version
    return true if item[:url] =~ %r{^/docs/[0-9]}
    # Redirect pages
    return true if item[:type] == 'redirectpage'
    false
  end

  # Items that we do not want to index
  def self.excluded_item(item, hierarchy_data)
    # Exclude all redirection
    return true unless item[:redirect_to].nil?
    # Exclude some parts of the page
    closest_heading = hierarchy_data[:hierarchy][-1]
    return true if closest_heading == 'Further Reading'
    return true if closest_heading == 'Version'
    return true if closest_heading == 'Related Rules'
    return true if closest_heading == 'Resources'
    return true if closest_heading == 'The following patterns are considered problems:'
    return true if closest_heading == 'The following patterns are not considered problems:'
    false
  end
 
  def self.blog?(item)
    item[:url] =~ %r{^/blog/}
  end

  def self.rule?(item)
    item[:url] =~ %r{^/docs/rules/}
  end

  def self.heading?(tag_name)
    %w(h1 h2 h3 h4 h5 h6).include?(tag_name)
  end

  def self.extract_rule_name_and_description(rule)
    # Excluding main page
    return {} if rule == 'Rules'

    # Page titles can have one of this two patterns
    # 1. rule-name: description
    matches = rule.match(/^(.*): (.*)$/)
    if matches
      return {
        name: matches[1],
        description: matches[2]
      }
    end

    # 2. description (rule-name)
    matches = rule.match(/^(.*) \((.*)\)$/)
    if matches
      return {
        name: matches[2],
        description: matches[1]
      }
    end

    {
      name: rule
    }
  end

  # Returns information about the item place in the page hierarchy
  # - main category (eg. Rule, Blog, etc)
  # - subcategory (eg. accessor-pairs, ESLint v1.7.0 released)
  # - display title (eg. Rule details, Rule details > getWithoutSet)
  # - hierarchy, array of all parent heading in order
  # - parent_heading_type, which heading is the closest
  def self.hierarchy_info(item)
    hierarchy = []

    %w(h1 h2 h3 h4 h5 h6).each do |h|
      hierarchy << item[h.to_sym] if item[h.to_sym]
    end

    # Split the main name in rule name and description
    if rule?(item)
      full_title = hierarchy.shift
      rule_data = extract_rule_name_and_description(full_title)
      # Adding name and description if found
      hierarchy_prefix = []
      if rule_data[:name]
        hierarchy_prefix << 'Rules'
        hierarchy_prefix << rule_data[:name]
      end
      hierarchy_prefix << rule_data[:description] if rule_data[:description]

      hierarchy = hierarchy_prefix + hierarchy
    end

    # Find the first three levels of display
    category = hierarchy[0]
    subcategory = hierarchy[1]
    display_title = [hierarchy[2], hierarchy[-1]].uniq.compact.join(' › ')

    # Find the closest parent heading type (including self)
    parent_heading_type = nil
    %w(h1 h2 h3 h4 h5 h6).each do |heading_type|
      break if item[heading_type.to_sym].nil?
      parent_heading_type = heading_type
    end

    {
      hierarchy: hierarchy,
      category: category,
      subcategory: subcategory,
      display_title: display_title,
      parent_heading_type: parent_heading_type
    }
  end

  # Anchors are added through the front-end so we'll have to generate them
  # before indexing the records
  def self.url(initial_item, parsed_item)
    closest_heading_type = parsed_item[:parent_heading_type]

    # Url is correct for top level element (under h1)
    return initial_item[:url] if closest_heading_type == 'h1'
    # Also correct if no closest heading
    return initial_item[:url] if closest_heading_type.nil?

    # Otherwise we guess it from the closest heading
    closest_heading_value = initial_item[closest_heading_type.to_sym]
    anchor = anchor(closest_heading_value)
    "#{initial_item[:url]}##{anchor}"
  end

  # Convert text to usable id
  def self.anchor(rough_text)
    # Ruby transcription of:
    # https://github.com/bryanbraun/anchorjs/blob/master/anchor.js
    tidy_text = rough_text.gsub(/[^\w\s-]/, '')
    tidy_text = tidy_text.gsub(/\s+/, '-')
    tidy_text = tidy_text.gsub(/-{2,}/, '-')
    tidy_text = tidy_text[0, 64]
    tidy_text = tidy_text.gsub(/^-+|-+$/, '')
    tidy_text.downcase
  end
end
