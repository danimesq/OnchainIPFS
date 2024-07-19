import { useCallback, useState, useEffect } from 'react';
import clsx from 'clsx';
import { parseEther } from 'viem';
import Button from '@/components/Button/Button';
import { useBuyMeACoffeeContract } from '../_contracts/useBuyMeACoffeeContract';
import useFields from '../_hooks/useFields';
import useOnchainCoffeeMemos from '../_hooks/useOnchainCoffeeMemos';
import ContractAlert from './ContractAlert';
import InputText from './InputText';
import Label from './Label';
import TextArea from './TextArea';
import TransactionSteps from './TransactionSteps';
import useSmartContractForms from './useSmartContractForms';

const GAS_COST = 0.0001;
const COFFEE_COUNT = [1, 2, 3, 4];

const initFields = {
  name: '',
  twitterHandle: '',
  lensHandle: '',
  farcasterHandle: '',
  message: '',
  coffeeCount: 1,
};

type Fields = {
  name: string;
  twitterHandle: string;
  lensHandle: string;
  farcasterHandle: string;
  coffeeCount: number;
  message: string;
};

type FormBuyCoffeeProps = {
  refetchMemos: ReturnType<typeof useOnchainCoffeeMemos>['refetchMemos'];
};

function FormBuyCoffee({ refetchMemos }: FormBuyCoffeeProps) {
  const contract = useBuyMeACoffeeContract();
  const { fields, setField, resetFields } = useFields<Fields>(initFields);
  const [showSocialInputs, setShowSocialInputs] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      setEthPrice(data.ethereum.usd);
    };

    fetchEthPrice();
  }, []);

  const reset = useCallback(async () => {
    resetFields();
    await refetchMemos();
  }, [refetchMemos, resetFields]);

  const { disabled, transactionState, resetContractForms, onSubmitTransaction } =
    useSmartContractForms({
      gasFee: parseEther(String(GAS_COST * fields.coffeeCount)),
      contract,
      name: 'buyCoffee',
      arguments: [
        fields.coffeeCount,
        fields.name,
        fields.twitterHandle,
        // fields.lensHandle,  // Commented out as per requirement
        // fields.farcasterHandle,  // Commented out as per requirement
        fields.message
      ],
      enableSubmit: fields.name !== '' && fields.message !== '',
      reset,
    });

  if (transactionState !== null) {
    return (
      <TransactionSteps
        transactionStep={transactionState}
        coffeeCount={fields.coffeeCount}
        resetContractForms={resetContractForms}
        gasCost={GAS_COST}
      />
    );
  }

  return (
    <>
      <h2 className="mb-5 w-full text-center text-2xl font-semibold text-white lg:text-left">
        Buy us a Cupcake!
      </h2>
      <form onSubmit={onSubmitTransaction} className="w-full">
        <div className="my-4 items-center lg:flex lg:gap-4">
          <div className="text-center text-4xl lg:text-left">🧁</div>
          <div className="mb-4 mt-2 text-center font-sans text-xl lg:my-0 lg:text-left">X</div>
          <div className="mx-auto flex max-w-[300px] gap-3 lg:max-w-max">
            {COFFEE_COUNT.map((count) => (
              <button
                key={`num-coffee-btn-${count}`}
                type="button"
                className={clsx(
                  `${fields.coffeeCount === count ? 'bg-gradient-2' : 'border border-boat-color-orange'} block h-[40px] w-full rounded lg:w-[40px]`,
                )}
                onClick={() => setField('coffeeCount', count)}
                title={`${(GAS_COST * count).toFixed(4)} ETH / $${ethPrice ? (GAS_COST * count * ethPrice).toFixed(2) : 'loading...'} `}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={clsx('mb-5', {
            'opacity-75 cursor-not-allowed': disabled
          })}>
            <Label htmlFor="name">Name</Label>
            <InputText
              id="name"
              placeholder="Name"
              onChange={(evt) => setField('name', evt.target.value)}
              disabled={disabled}
              required
            />
          </div>

          <div className={clsx('mb-5 flex items-center', {
            'opacity-75 cursor-not-allowed': disabled
          })}>
            <Label htmlFor="lensHandle">Lens handle (Optional)</Label>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <img src="/img/social/button/lens.svg" alt="Lens" className="w-4 h-4" />
              <InputText
                id="lensHandle"
                placeholder="@"
                onChange={(evt) => setField('lensHandle', evt.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="mb-5">
            <button type="button" onClick={() => setShowSocialInputs(!showSocialInputs)}>
              {showSocialInputs ? 'Show less social networks ▲' : 'Show more social networks ▼'}
            </button>
          </div>

          {showSocialInputs && (
            <>
              <div className={clsx('mb-5 flex items-center', {
                'opacity-75 cursor-not-allowed': disabled
              })}>
                <Label htmlFor="twitterHandle">Twitter handle (Optional)</Label>
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <img src="/img/social/button/twitter.svg" alt="Twitter" className="w-4 h-4" />
                  <InputText
                    id="twitterHandle"
                    placeholder="@"
                    onChange={(evt) => setField('twitterHandle', evt.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className={clsx('mb-5 flex items-center', {
                'opacity-75 cursor-not-allowed': disabled
              })}>
                <Label htmlFor="farcasterHandle">Farcaster handle (Optional)</Label>
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <img src="/img/social/button/farcaster.svg" alt="Farcaster" className="w-4 h-4" />
                  <InputText
                    id="farcasterHandle"
                    placeholder="@"
                    onChange={(evt) => setField('farcasterHandle', evt.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </>
          )}

          <div className={clsx('mb-5', {
            'opacity-75 cursor-not-allowed': disabled
          })}>
            <Label htmlFor="message">💌 Message</Label>
            <TextArea
              id="message"
              placeholder="Say something"
              onChange={(evt) => setField('message', evt.target.value)}
              disabled={disabled}
              required
            />
          </div>

          <ContractAlert contract={contract} amount={GAS_COST} coffeeCount={fields.coffeeCount} ethPrice={ethPrice} />

          <Button
            buttonContent={
              <>
                Send {fields.coffeeCount} cupcake{fields.coffeeCount > 1 ? 's' : ''} for{' '}
                {(GAS_COST * fields.coffeeCount).toFixed(4)} ETH (${ethPrice ? (GAS_COST * fields.coffeeCount * ethPrice).toFixed(2) : 'loading...'})
              </>
            }
            type="submit"
            disabled={disabled}
            className={clsx(
              'w-auto px-10 transition-opacity duration-300 ease-in-out',
              {
                'opacity-50 cursor-not-allowed': disabled,
                'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500': !disabled
              }
            )}
          />
        </div>
      </form>
    </>
  );
}

export default FormBuyCoffee;