-- Create a PostgreSQL function that can execute raw SQL
-- This enables programmatic migration application via the Supabase REST API
--
-- SECURITY WARNING: This function should only be accessible to service role
-- After running migrations, consider dropping this function for security

-- Create the function
CREATE OR REPLACE FUNCTION exec_raw_sql(sql_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the function creator
AS $$
DECLARE
  result_message TEXT;
BEGIN
  -- Execute the provided SQL
  EXECUTE sql_query;

  result_message := 'SQL executed successfully';
  RETURN result_message;
EXCEPTION
  WHEN OTHERS THEN
    RETURN format('Error: %s - %s', SQLSTATE, SQLERRM);
END;
$$;

-- Grant execute permission only to authenticated and service role
GRANT EXECUTE ON FUNCTION exec_raw_sql(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION exec_raw_sql(TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION exec_raw_sql(TEXT) IS 'Executes raw SQL statements - USE WITH EXTREME CAUTION';

-- After using this function, you can drop it for security:
-- DROP FUNCTION IF EXISTS exec_raw_sql(TEXT);
