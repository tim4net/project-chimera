#!/usr/bin/env node
/**
 * Test script to verify Supabase cloud connection
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase Cloud Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Health check via REST API
    console.log('Test 1: Health check...');
    const { data, error } = await supabase.from('characters').select('count');

    if (error && error.code === 'PGRST301') {
      console.log('✅ Connection successful! (No auth required for count)');
    } else if (!error) {
      console.log('✅ Connection successful! Characters count:', data);
    } else {
      console.log('❌ Error:', error.message);
    }

    // Test 2: Sign up a test user
    console.log('\nTest 2: Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123456'
    });

    if (authError) {
      if (authError.message.includes('Email rate limit exceeded')) {
        console.log('⚠️  Email rate limit - auth provider is working but limited');
      } else if (authError.message.includes('not enabled')) {
        console.log('⚠️  Email auth not enabled yet - enable in dashboard');
      } else {
        console.log('❌ Auth error:', authError.message);
      }
    } else {
      console.log('✅ Auth successful! User:', authData.user?.email);
    }

    // Test 3: Check tables exist
    console.log('\nTest 3: Checking database schema...');
    const tables = ['characters', 'items', 'journal_entries'];

    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count');
      if (tableError) {
        console.log(`❌ Table "${table}" error:`, tableError.message);
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    }

    console.log('\n🎉 All tests completed!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
