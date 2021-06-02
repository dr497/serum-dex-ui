import React from 'react';
import { Layout, Row, Col, Grid } from 'antd';
import Link from './Link';
import { helpUrls } from './HelpUrls';
import logo from '../assets/solible-logo.svg';
import discord from '../assets/social/discord.svg';
import telegram from '../assets/social/telegram.svg';
import twitter from '../assets/social/twitter.svg';

const { Footer } = Layout;
const { useBreakpoint } = Grid;

const footerElements = [
  {
    description: 'Twitter',
    link: helpUrls.twitter,
  },
  { description: 'Support', link: helpUrls.support },
  { description: 'Bonfida', link: helpUrls.bonfida },
];

const styles = {
  footer: {
    height: '60px',
    paddingBottom: 10,
    paddingTop: 10,
    background: '#121837',
  },
  link: {
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    paddingLeft: 20,
    paddingRight: 20,
  },
  discord: {
    height: 25,
    cursor: 'pointer',
  },
  telegram: {
    height: 20,
    marginRight: 25,
    marginLeft: 25,
    cursor: 'pointer',
  },
  twitter: {
    height: 20,
    cursor: 'pointer',
  },
  ipfs: {
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    marginTop: 10,
    marginLeft: 10,
  } as React.CSSProperties,
};

export const CustomFooter = () => {
  const smallScreen = !useBreakpoint().lg;

  return (
    <Footer style={styles.footer}>
      <Row align="middle" justify="space-around">
        <Col>
          <img src={logo} alt="" />
        </Col>
        {!smallScreen && (
          <Col>
            {footerElements.map((elem, index) => {
              return (
                <Link
                  key={`footer-elem-${index}-${elem.description}`}
                  external
                  to={elem.link}
                  style={styles.link}
                >
                  {elem.description}
                </Link>
              );
            })}
          </Col>
        )}
        <Col>
          <img
            src={discord}
            style={styles.discord}
            onClick={() => (window.location.href = helpUrls.discord)}
            alt=""
          />
          <img
            src={telegram}
            style={styles.telegram}
            onClick={() => (window.location.href = helpUrls.telegram)}
            alt=""
          />
          <img
            src={twitter}
            style={styles.twitter}
            onClick={() => (window.location.href = helpUrls.twitter)}
            alt=""
          />
        </Col>
      </Row>
    </Footer>
  );
};
