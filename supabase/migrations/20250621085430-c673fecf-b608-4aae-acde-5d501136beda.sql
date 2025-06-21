
-- Create a database function for hybrid account deletion
CREATE OR REPLACE FUNCTION public.hybrid_delete_user_account(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_user_uuid UUID := '00000000-0000-0000-0000-000000000000';
  result JSON;
BEGIN
  -- Start transaction
  BEGIN
    -- 1. Anonymize orders (keep for business records)
    UPDATE public.orders 
    SET 
      user_id = deleted_user_uuid,
      delivery_info = CASE 
        WHEN delivery_info IS NOT NULL THEN '[REDACTED - User Deleted]'
        ELSE NULL
      END
    WHERE user_id = target_user_id;
    
    -- 2. Anonymize transactions (keep for business records)
    UPDATE public.transactions 
    SET user_id = deleted_user_uuid
    WHERE user_id = target_user_id;
    
    -- 3. Anonymize disputes (keep for legal purposes)
    UPDATE public.disputes 
    SET 
      user_id = deleted_user_uuid,
      description = CASE 
        WHEN description IS NOT NULL THEN '[REDACTED - User Deleted]'
        ELSE NULL
      END
    WHERE user_id = target_user_id;
    
    -- 4. Delete profile (personal data)
    DELETE FROM public.profiles WHERE id = target_user_id;
    
    -- 5. Remove from admin_users if exists
    DELETE FROM public.admin_users WHERE user_id = target_user_id;
    
    result := json_build_object(
      'success', true,
      'message', 'Account successfully deleted with data anonymization'
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback on error
    RAISE;
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
  END;
END;
$$;

-- Grant execute permission to authenticated users (they can only delete their own account)
GRANT EXECUTE ON FUNCTION public.hybrid_delete_user_account(UUID) TO authenticated;
