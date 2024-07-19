import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const EntityNode = ({ data }) => {
  const { query, comment, thumbnail, card_size, relevance } = data;

  // Calculate sizes based on relevance and card_size
  const fontSize = Math.max(10, Math.min(16, 10 + relevance * 6));
  const imageSize = Math.max(30, Math.min(100, card_size));
  const maxCommentLength = Math.floor(card_size * 1.5);

  const truncatedComment =
    comment.length > maxCommentLength
      ? comment.substring(0, maxCommentLength) + '...'
      : comment;

  return (
    <div
      style={{
        width: card_size,
        height: card_size,
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '8px',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: `${fontSize}px`,
      }}>
      <Handle type='target' position={Position.Top} />
      <img
        src={thumbnail || 'https://via.placeholder.com/50'}
        alt={query}
        style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          objectFit: 'cover',
          borderRadius: '4px',
        }}
      />
      <div
        style={{ fontWeight: 'bold', marginTop: '4px', textAlign: 'center' }}>
        {query}
      </div>
      <div
        style={{
          fontSize: `${fontSize * 0.8}px`,
          marginTop: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
        {truncatedComment}
      </div>
      <Handle type='source' position={Position.Bottom} />
    </div>
  );
};

export default memo(EntityNode);
