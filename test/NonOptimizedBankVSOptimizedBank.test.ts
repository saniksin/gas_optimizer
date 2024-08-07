import { loadFixture, ethers, expect } from "./setup";

describe("Comparing two contracts, optimized and non-optimized", function () {
  // создаем рандомные адреса, позже понадобятся для проверки
  const users = [ethers.Wallet.createRandom().address, ethers.Wallet.createRandom().address];

  // деплоим 2 контракта в сеть
  async function deployContractsFixture() {
    const [owner] = await ethers.getSigners();

    const NonOptimizedBankFactory = await ethers.getContractFactory("NonOptimizedBank");
    const nonOptimizedBank = await NonOptimizedBankFactory.deploy();
    await nonOptimizedBank.waitForDeployment();

    const OptimizedBankFactory = await ethers.getContractFactory("OptimizedBank");
    const optimizedBank = await OptimizedBankFactory.deploy();
    await optimizedBank.waitForDeployment();
    
    return { nonOptimizedBank, optimizedBank, owner };
  }

  // проверяем все функции по очереди у неоптимизированного контракта 
  describe("NonOptimizedBank", function () {

    // deposit
    it("should measure gas usage for deposit", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      const tx = await nonOptimizedBank.deposit({ value: ethers.parseEther("1") });
      const receipt = await tx.wait();

      expect(receipt).not.to.be.undefined;
    });

    // withdraw
    it("should measure gas usage for withdraw", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      await nonOptimizedBank.deposit({ value: ethers.parseEther("1") });
      const tx = await nonOptimizedBank.withdraw(ethers.parseEther("0.5"));
      const receipt = await tx.wait();

      expect(receipt).not.to.be.undefined;
    });

    // countUsersAndBalances
    it("should measure gas usage for countUsersAndBalances", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      await nonOptimizedBank.deposit({ value: ethers.parseEther("1") });
      const gasUsed = await nonOptimizedBank.countUsersAndBalances();
      
      expect(gasUsed).not.to.be.undefined;
    });

    // countUsersAndBalancesCalldata
    it("should measure gas usage for countUsersAndBalancesCalldata", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      await nonOptimizedBank.deposit({ value: ethers.parseEther("1") });
      const gasUsed = await nonOptimizedBank.countUsersAndBalancesCalldata(users);
      
      expect(gasUsed).not.to.be.undefined;
    });

    // calculate
    it("should measure gas usage for calculate", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      const gasUsed = await nonOptimizedBank.calculate(5, 3);
      
      expect(gasUsed).not.to.be.undefined;
    });
    
    // все таски в одной задаче внутри контракта (deposit, withdraw, countUsersAndBalances, countUsersAndBalancesCalldata, calculate)
    it("should measure gas usage for allTasks", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      const tx = await nonOptimizedBank.allTasks(users, 5, 3, { value: ethers.parseEther("1") });
      const receipt = await tx.wait();

      expect(receipt).not.to.be.undefined;
      console.log("      Gas used for allTasks (non-optimized):", receipt?.gasUsed.toString());
    });
  });

  // проверяем все функции по очереди у оптимизированного контракта 
  describe("OptimizedBank", function () {

    // deposit 
    it("should measure gas usage for deposit", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      const tx = await optimizedBank.deposit({ value: ethers.parseEther("1") });
      const receipt = await tx.wait();

      expect(receipt).not.to.be.undefined;
    });

    // withdraw 
    it("should measure gas usage for withdraw", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      await optimizedBank.deposit({ value: ethers.parseEther("1") });
      const tx = await optimizedBank.withdraw(ethers.parseEther("0.5"));
      const receipt = await tx.wait();

      expect(receipt).not.to.be.undefined;
    });

    // countUsersAndBalances 
    it("should measure gas usage for countUsersAndBalances", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      await optimizedBank.deposit({ value: ethers.parseEther("1") });
      const gasUsed = await optimizedBank.countUsersAndBalances();
      
      expect(gasUsed).not.to.be.undefined;
    });

    // countUsersAndBalancesCalldata 
    it("should measure gas usage for countUsersAndBalancesCalldata", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      await optimizedBank.deposit({ value: ethers.parseEther("1") });
      const gasUsed = await optimizedBank.countUsersAndBalancesCalldata(users);
      
      expect(gasUsed).not.to.be.undefined;
    });

    // calculate
    it("should measure gas usage for calculate", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      const gasUsed = await optimizedBank.calculate(5, 3);
      
      expect(gasUsed).not.to.be.undefined;
    });

    // все таски в одной задаче внутри контракта (deposit, withdraw, countUsersAndBalances, countUsersAndBalancesCalldata, calculate)
    it("should measure gas usage for allTasks", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      const tx = await optimizedBank.allTasks(users, 5, 3, { value: ethers.parseEther("1") });
      const receipt = await tx.wait();

      expect(receipt).not.to.be.undefined;
      console.log("      Gas used for allTasks (optimized):", receipt?.gasUsed.toString());
    });
  });

  // добиваем coverage на 100%
  describe("NonOptimizedBank - require statements", function () {
    it("should revert deposit with zero amount", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      await expect(nonOptimizedBank.deposit({ value: 0 })).to.be.revertedWithCustomError(nonOptimizedBank, 'DepositAmountZero');
    });

    it("should revert withdrawal with zero amount", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      await nonOptimizedBank.deposit({ value: ethers.parseEther("1") });
      await expect(nonOptimizedBank.withdraw(0)).to.be.revertedWithCustomError(nonOptimizedBank, 'WithdrawalAmountZero');
    });

    it("should revert withdrawal with insufficient balance", async function () {
      const { nonOptimizedBank } = await loadFixture(deployContractsFixture);

      await nonOptimizedBank.deposit({ value: ethers.parseEther("1") });
      await expect(nonOptimizedBank.withdraw(ethers.parseEther("2"))).to.be.revertedWithCustomError(nonOptimizedBank, 'WithdrawalAmountExceedsBalance');
    });
  });

  // добиваем coverage на 100%
  describe("OptimizedBank - require statements", function () {
    it("should revert deposit with zero amount", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      await expect(optimizedBank.deposit({ value: 0 })).to.be.revertedWithCustomError(optimizedBank, 'DepositAmountZero');
    });

    it("should revert withdrawal with zero amount", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      await optimizedBank.deposit({ value: ethers.parseEther("1") });
      await expect(optimizedBank.withdraw(0)).to.be.revertedWithCustomError(optimizedBank, 'WithdrawalAmountZero');
    });

    it("should revert withdrawal with insufficient balance", async function () {
      const { optimizedBank } = await loadFixture(deployContractsFixture);

      await optimizedBank.deposit({ value: ethers.parseEther("1") });
      await expect(optimizedBank.withdraw(ethers.parseEther("2"))).to.be.revertedWithCustomError(optimizedBank, 'WithdrawalAmountExceedsBalance');
    });
  });
});
