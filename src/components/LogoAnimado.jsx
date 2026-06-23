// src/components/LogoAnimado.jsx
import React from 'react';
import styled from 'styled-components';

const LogoAnimado = () => {
  return (
    <Wrapper>
      <div className="coin">
        <div className="side front" style={{ background: '#4a7c42', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Inter, sans-serif' }}>eat<b>&amp;</b>run</span>
        </div>
        <div className="side back" style={{ background: '#4a7c42', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Inter, sans-serif' }}>eat<b>&amp;</b>run</span>
        </div>
      </div>
    </Wrapper>
  );
};

export default LogoAnimado;

const Wrapper = styled.div`
  .coin {
    position: relative;
    width: 100px;
    height: 100px;
    margin: auto;
    transform-style: preserve-3d;
    animation: spin 4s linear infinite;
  }

  .side {
    position: absolute;
    width: 100px;
    height: 100px;
    backface-visibility: hidden;
    border-radius: 50%;
    overflow: hidden;
  }

  .front {
    transform: rotateY(0deg);
  }

  .back {
    transform: rotateY(180deg);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @keyframes spin {
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }
`;
