import { useEffect, useState } from "react";
import {
  useMoralis,
  useMoralisSolanaApi,
  useMoralisSolanaCall,
} from "react-moralis";
import {
  Blockie,
  Button,
  Select,
  Loading,
  Table,
  Avatar,
  Tag,
  getEllipsisTxt,
} from "web3uikit";

function App() {
  const [network, setNetwork] = useState("mainnet");
  const {
    isAuthenticated,
    authenticate,
    user,
    isInitializing,
    isInitialized,
    isAuthenticating,
    logout,
  } = useMoralis();
  const { account } = useMoralisSolanaApi();
  const { fetch, data, isLoading } = useMoralisSolanaCall(account.getPortfolio);

  /**
   * @description the function handles authentication with phantom wallet
   */
  const onConnectPhantomWallet = async () => {
    await authenticate({
      type: "sol",
    });
  };

  useEffect(() => {
    if (isAuthenticated && user.get("solAddress")) {
      // Fetch only when authenticated
      fetch({
        params: {
          address: user.get("solAddress"),
          network,
        },
      });
    }
  }, [fetch, isAuthenticated, user, network]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      {!isInitialized || isInitializing ? (
        <Loading spinnerColor="#2E7DAF" size={50} />
      ) : (
        <>
          {isAuthenticated ? (
            <>
              <Blockie seed={user?.get("solAddress")} size={20} />
              <p>{user?.get("solAddress")}</p>
              <Button onClick={() => logout()} text="Disconnect Wallet" />
              <Select
                label="Network"
                onChange={(option) => {
                  const { id } = option ?? {};
                  setNetwork(id);
                }}
                defaultOptionIndex={0}
                options={[
                  {
                    id: "mainnet",
                    label: "Mainnet",
                  },
                  {
                    id: "devnet",
                    label: "Devnet",
                  },
                ]}
              />
              {isLoading ? (
                <Loading spinnerColor="#2E7DAF" text="Fetching Data..." />
              ) : (
                <Table
                  columnsConfig="80px 3fr 2fr 2fr"
                  data={[
                    [
                      <Avatar isRounded theme="image" />,
                      "SOL",
                      <Tag color="blue" text="Native Token" />,
                      data?.nativeBalance?.solana,
                    ],
                    ...data?.tokens?.map((token) => {
                      return [
                        <Avatar isRounded theme="image" />,
                        getEllipsisTxt(token.associatedTokenAddress),
                        <Tag color="red" text="SPL Token" />,
                        token.amount,
                      ];
                    }),
                    ...data?.nfts?.map((nft) => {
                      return [
                        <Avatar isRounded theme="image" />,
                        getEllipsisTxt(nft.associatedTokenAddress),
                        <Tag color="yellow" text="SPL NFT" />,
                        1,
                      ];
                    }),
                  ]}
                  header={[
                    "",
                    <span>Name</span>,
                    <span>Type</span>,
                    <span>Amount</span>,
                  ]}
                  maxPages={3}
                  noPagination
                  onPageNumberChanged={function noRefCheck() {}}
                  pageSize={5}
                />
              )}
            </>
          ) : (
            <>
              <h1>Solana DeFi Dashboard</h1>
              <Button
                onClick={onConnectPhantomWallet}
                isLoading={isAuthenticating}
                loadingText="Authenticating..."
                text="Connect Wallet"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
