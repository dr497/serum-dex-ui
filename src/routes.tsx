import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import BasicLayout from './components/BasicLayout';
import ExplorePage from './pages/ExplorePage';
import TradePage from './pages/TradePage';
import RedeemPage from './pages/RedeemPage';
import CollectionPage from './pages/CollectionPage';
import ListingPage from './pages/ListingPage';

export function Routes() {
  return (
    <>
      <HashRouter basename={'/'}>
        <BasicLayout>
          <Switch>
            <Route exact path="/">
              <ExplorePage />
            </Route>
            <Route exact path="/explore">
              <ExplorePage />
            </Route>
            <Route exact path="/market/:marketAddress">
              <TradePage />
            </Route>
            <Route exact path="/redeem/:mintAddress">
              <RedeemPage />
            </Route>
            <Route exact path="/collection">
              <CollectionPage />
            </Route>
            <Route exact path="/list">
              <ListingPage />
            </Route>
          </Switch>
        </BasicLayout>
      </HashRouter>
    </>
  );
}
