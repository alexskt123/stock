import { useState, Fragment, useEffect } from "react";
import firebase, { auth, authUI } from "../../config/fire-config";
import { defaultUserConfig } from '../../config/settings'
import { getStockListByUID } from '../../lib/firebaseResult'
import { Badge, Button, Modal } from "react-bootstrap";
import { NavDropdown } from 'react-bootstrap'
import { FaUserCircle, FaList } from 'react-icons/fa'
import { BiTime } from 'react-icons/bi'
import moment from 'moment-business-days'

import 'firebaseui/dist/firebaseui.css'
import Link from "next/link";

function FireAuth() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState(null)
  const [userConfig, setUserConfig] = useState({ ...defaultUserConfig })

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  }

  const handleSignOut = () => {
    auth.signOut()
    setUser(null)
  }

  const handleUIError = (error) => {
    console.log(error)
  }

  const uiConfig = {
    autoUpgradeAnonymousUsers: true,
    //signInSuccessUrl: '/basics',
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        //var user = authResult.user;
        // var credential = authResult.credential;
        // var isNewUser = authResult.additionalUserInfo.isNewUser;
        // var providerId = authResult.additionalUserInfo.providerId;
        // var operationType = authResult.operationType;

        handleClose()
        // Do something with the returned AuthResult.
        // Return type determines whether we continue the redirect
        // automatically or whether we leave that to developer to handle.
        return false;
      },
      signInFailure: function (error) {
        // Some unrecoverable error occurred during sign-in.
        // Return a promise when error handling is completed and FirebaseUI
        // will reset, clearing any UI. This commonly occurs for error code
        // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
        // occurs. Check below for more details on this.
        return handleUIError(error);
      }
    },
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    signInFlow: "popup"
  }

  auth.onAuthStateChanged((user) => setUser(user));

  useEffect(async () => {
    if (show && document.querySelector('.firebaseui-auth-container'))
      authUI.start(".firebaseui-auth-container", uiConfig);

    if (user) {
      const stockList = await getStockListByUID(user.uid)

      setUserConfig({
        ...defaultUserConfig,
        displayName: user.displayName ? user.displayName : 'Anonymous',
        loginTime: moment().format("HH:mm:ss DD/MM/YYYY"),
        stockList
      })
    }
  }, [show, user]);

  return (
    <Fragment>
      {
        !user ?
          <NavDropdown.Item onClick={handleShow}>
            <Badge variant="success">{'Sign In'}</Badge>
          </NavDropdown.Item>
          :
          <Fragment>
            <NavDropdown.Item >
              <FaUserCircle />
              <Badge className="ml-1" variant="dark">
                {userConfig.displayName}
              </Badge>
              <BiTime className="ml-2" />
              <Badge variant="light">
                {`${userConfig.loginTime}`}
              </Badge>
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item>
              <p>
                <FaList />
                <Badge className="ml-1" variant="dark">{'Stock List'}</Badge>
              </p>
              {userConfig.stockList.map((item, idx) => {
                return <Badge className="ml-1" key={idx} variant="light"><Link href={`/basics?query=${item}`}>{item}</Link></Badge>
              })}
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleSignOut}>
              <Badge variant="danger">{'Sign Out'}</Badge>
            </NavDropdown.Item>
          </Fragment>
      }
      <Modal centered size="sm" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sign In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="firebaseui-auth-container"></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
}

export default FireAuth;