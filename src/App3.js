import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 25px;
  border: var(--primary);
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 16px;
  color: var(--accent);
  width: 150px;
  height: 35px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;




export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 25px;
  color: var(--accent);
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click to mint your ELEMENTAI.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(130000);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 5) {
      newMintAmount = 5;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    // Calculate the time remaining in the timer
    const endTime = new Date("2022-12-21T11:30:00Z");
    const timeRemaining = endTime - new Date();

    // Set the initial time remaining
    setTimeRemaining(timeRemaining);

    // Update the time remaining every second
    const interval = setInterval(() => {
      setTimeRemaining(timeRemaining - 1000);
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);


  return (
    <s.Screen>
      <s.Container
        flex={1}
        jc={"center"}
        ai={"center"}
        style={{ padding: 100, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >




        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>

          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              //backgroundColor: "var(--accent)",
              padding: 20, //24
              //borderRadius: 30, //24
              //border: "4px dashed var(--secondary)",
              //boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
              opacity: 1
            }}
          //image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}

          >

            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 100,
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Tengoko Warriors
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              The pandemonium on the blockchain is unleashed! Defeat other players in epic battle and become the Champion of Tengoko

            </s.TextDescription>






            <s.SpacerLarge />
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Mint Mar 24, 12:30 UTC
            </s.TextDescription>





            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              {truncate(
                new Date(timeRemaining).toLocaleString("en-GB", {
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                }),
                10
              )}
            </s.TextDescription>




            <s.TextTitle
              style={{ textAlign: "center", color: "var(--primary)", fontSize: 40 }}
            >
              Price: {CONFIG.DISPLAY_COST}{" "}
              {CONFIG.NETWORK.SYMBOL}
            </s.TextTitle>





            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Supply: {CONFIG.MAX_SUPPLY}
            </s.TextTitle>


            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Warriors minted: {data.totalSupply}
            </s.TextTitle>








            <span
              style={{
                textAlign: "center",
              }}
            >

            </span>






            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--primary-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--primary-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>

              </>
            ) : (
              <>

                {/* <s.SpacerXSmall />

                <s.SpacerSmall /> */}
                {blockchain.account === "" ||
                  blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>

                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}


                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--primary)",
                        fontSize: 20,
                      }}
                    >
                      Mint up to 5 WARRIORS:
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          fontSize: 30,
                          textAlign: "center",
                          color: "var(--primary)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>

                      <s.SpacerMedium />

                    </s.Container>
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.TextDescription
                      style={{
                        fontSize: 30,
                        textAlign: "center",
                        color: "var(--primary)",
                      }}
                    >
                      {(mintAmount * CONFIG.DISPLAY_COST).toFixed(1)} ETH
                    </s.TextDescription>

                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>





                    </s.Container>

                  </>
                )}
              </>
            )}


            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.SpacerLarge />




            {/* <StyledButton
              style={{
                margin: "5px",
              }}
              onClick={(e) => {
                window.open(CONFIG.MARKETPLACE_LINK, "_blank");
              }}
            >
              {CONFIG.MARKETPLACE}
            </StyledButton> */}


            {/* <StyledButton
              style={{
                margin: "5px",
              }}
              onClick={(e) => {
                window.open(CONFIG.SCAN_LINK, "_blank");
              }}
            >
              Etherscan
            </StyledButton> */}



















          </s.Container>
          <s.SpacerLarge />
        </ResponsiveWrapper>




        <s.SpacerLarge />

        <s.SpacerLarge />

        <s.SpacerMedium />

      </s.Container>
    </s.Screen>
  );
}

export default App;