import {
  Activation,
  Neuron,
  NeuralNetworkLayer,
  NeuralNetwork,
  brziLayer,
} from "./nn";

export default function Test() {
  let inputs = [1, 2, 3];

  let sigmoid = new Activation("Sigmoid", function(z) {
    return 1 / (1 + Math.exp(-z));
  })

  console.log("=".repeat(30));
  console.log("ПРОБА НЕУРОНА");
  let neuron = new Neuron(sigmoid, 3);

  console.log(neuron.calcZ(inputs));
  console.log(neuron.calcA(inputs));
  console.log(neuron.str());
  console.log("=".repeat(30));

  console.log("ПРОБА СЛОЈА");
  let nnLayer = new NeuralNetworkLayer(
    [new Neuron(sigmoid, 3), new Neuron(sigmoid, 3), new Neuron(sigmoid, 3)],
    3
  );

  console.log(nnLayer.calcZ(inputs));
  console.log(nnLayer.calcA(inputs));
  console.log(nnLayer.str());
  console.log("=".repeat(30));

  console.log("ПРОБА НЕУРОНСКЕ МРЕЖЕ");
  let nn = new NeuralNetwork([
    new NeuralNetworkLayer(
      [new Neuron(sigmoid, 3), new Neuron(sigmoid, 3), new Neuron(sigmoid, 3)],
      3
    ),
    new NeuralNetworkLayer(
      [
        new Neuron(sigmoid, 3),
        new Neuron(sigmoid, 3),
        new Neuron(sigmoid, 3),
        new Neuron(sigmoid, 3),
        new Neuron(sigmoid, 3),
      ],
      3
    ),
    new NeuralNetworkLayer(
      [new Neuron(sigmoid, 5), new Neuron(sigmoid, 5), new Neuron(sigmoid, 5)],
      5
    ),
  ]);

  console.log(nn.calcA(inputs));
  console.log(nn.str());
  console.log("=".repeat(30));

  console.log("ПРОБА БРЗОГ ПРАВЉЕЊА СЛОЈА");
  let nnBrzi = new NeuralNetwork([
    brziLayer(sigmoid, 3, 3),
    brziLayer(sigmoid, 5, 3),
    brziLayer(sigmoid, 1, 5),
  ]);

  console.log(nnBrzi.calcA(inputs));
  console.log(nnBrzi.str());
  console.log("=".repeat(30));
  console.log("ПРОБЕ ГОТОВЕ!");
  console.log("=".repeat(30));
}
