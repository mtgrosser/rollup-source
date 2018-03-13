lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rollup/source/version'

Gem::Specification.new do |s|
  s.name          = 'rollup-source'
  s.version       = Rollup::Source::VERSION
  s.date          = '2018-03-12'
  s.authors       = ['Matthias Grosser']
  s.email         = ['mtgrosser@gmx.net']
  s.license       = 'MIT'

  s.summary       = 'Rollup JS source'
  s.homepage      = 'https://github.com/mtgrosser/rollup-source'

  s.files = ['LICENSE',
             'lib/rollup/source.rb',
             'lib/rollup/source/version.rb',
             'lib/rollup.js']
             
  s.add_development_dependency 'bundler', '~> 1.16'
  s.add_development_dependency 'rake', '~> 10.0'
  s.add_development_dependency 'minitest', '~> 5.0'
end
