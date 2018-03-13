require 'rollup/source/version'

module Rollup
  module Source
    class << self
      def path
        File.join(File.dirname(__FILE__), '..')
      end
      
      def code
        File.read(File.join(path, 'rollup.js'))
      end
    end
  end
end
