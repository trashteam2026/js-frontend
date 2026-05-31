import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #d6dce8;
  padding: 50px 40px;
  border-radius: 10px;
  text-align: center;
  /* Fixed card width so long content (e.g. the access-denied error) wraps
     inside the box instead of stretching it. width:100% + max-width keeps it
     stable on desktop and responsive on mobile (capped by the page padding). */
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
`;

export const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  margin-bottom: 6px;
  color: #1a2b4a;
`;
