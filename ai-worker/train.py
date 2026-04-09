import os
import time
import pytorch_lightning as pl
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from pytorch_lightning.callbacks import ModelCheckpoint, Callback

CHECKPOINT_DIR = "checkpoints"

class DummyModel(pl.LightningModule):
    def __init__(self):
        super().__init__()
        self.layer = nn.Sequential(
            nn.Linear(10, 32),
            nn.ReLU(),
            nn.Linear(32, 2)
        )
        self.loss_fn = nn.MSELoss()
    
    def forward(self, x):
        return self.layer(x)
    
    def training_step(self, batch, batch_idx):
        x, y = batch
        preds = self(x)
        loss = self.loss_fn(preds, y)
        self.log('train_loss', loss, prog_bar=True)
        time.sleep(0.05) # Slow down to simulate heavy computation and allow metrics to update
        return loss
    
    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=1e-3)

class CarbonAwareCallback(Callback):
    def __init__(self, action_file="action.txt"):
        self.action_file = action_file

    def on_train_epoch_end(self, trainer, pl_module):
        # We simulate receiving real-time signals via a text file or an env variable.
        # Here we just read an 'action.txt' file that the main worker updates.
        if os.path.exists(self.action_file):
            with open(self.action_file, "r") as f:
                action = f.read().strip()
                if action in ["PAUSE", "MIGRATE"]:
                    print(f"\n[TRAINER] Instruction received: {action}. Halting gracefully...")
                    trainer.should_stop = True

def get_dataloader():
    # Dummy data, large enough to take ~1-2 seconds per epoch
    x = torch.randn(10000, 10)
    y = torch.randn(10000, 2)
    dataset = TensorDataset(x, y)
    # Use smaller batches/more items so it's not instantly done
    return DataLoader(dataset, batch_size=64)

def run_training_session(max_epochs=10):
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    
    model = DummyModel()
    dataloader = get_dataloader()

    # Find the latest checkpoint if it exists
    latest_ckpt = None
    if os.path.exists(CHECKPOINT_DIR):
        ckpts = [f for f in os.listdir(CHECKPOINT_DIR) if f.endswith('.ckpt') and 'last' in f]
        if ckpts:
            latest_ckpt = os.path.join(CHECKPOINT_DIR, sorted(ckpts)[-1])

    checkpoint_callback = ModelCheckpoint(
        dirpath=CHECKPOINT_DIR,
        filename="{epoch:02d}",
        save_top_k=0,
        save_last=True
    )
    
    carbon_callback = CarbonAwareCallback("action.txt")

    trainer = pl.Trainer(
        max_epochs=max_epochs,
        callbacks=[checkpoint_callback, carbon_callback],
        enable_progress_bar=True,
        logger=False
    )

    if latest_ckpt:
        print(f"\n[TRAIN] Resuming training from {latest_ckpt}")
    else:
        print("\n[TRAIN] Starting new training session")

    # Clear state before we start
    if not os.path.exists("action.txt"):
        with open("action.txt", "w") as f:
            f.write("RUN")

    trainer.fit(model, dataloader, ckpt_path=latest_ckpt)

    if trainer.should_stop:
        return "INTERRUPTED"
    return "DONE"

if __name__ == "__main__":
    run_training_session()