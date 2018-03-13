require "test_helper"

class RollupSourceTest < Minitest::Test
  def test_that_it_has_a_version_number
    refute_nil Rollup::Source::VERSION
  end

  def test_it_provides_the_rollup_source
    assert Rollup::Source.code.size > 0
  end
end
