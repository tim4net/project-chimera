// Manual mock for @supabase/supabase-js

// Create a mock that supports method chaining and promise resolution
const createMockChain = () => {
  const chain = {
    from: jest.fn(() => chain),
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => chain),
    then: function(resolve) {
      // Make the chain thenable for await
      return Promise.resolve({
        data: [{ id: 'test-id', name: 'Test Character', idle_task: null }],
        error: null
      }).then(resolve);
    }
  };
  return chain;
};

const createClient = jest.fn(() => createMockChain());

module.exports = {
  createClient,
};
